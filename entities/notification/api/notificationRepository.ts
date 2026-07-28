// 알람 발송

import { err, ok, Result } from "@/shared/kernel/Result";
import { CustomUserAuth } from "@/shared/lib/auth";
import { SupabaseClient } from "@supabase/supabase-js";
import { Notification, NotificationFromRowError } from "../model/Notification";
import { NotificationId } from "../model/NotificationId";
import { NotificationInsert } from "../model/types";

export type NotificationRepositoryError = 
| { readonly kind: 'NotFound', readonly id: NotificationId }
| { readonly kind: 'Infra', readonly message: string }
| { readonly kind: 'Mapping', readonly cause: NotificationFromRowError }

export async function createNotification(supabase: SupabaseClient, notification: NotificationInsert): Promise<Result<Notification, NotificationRepositoryError>> {

    const row = Notification.toInsertRow(notification);

    const { data, error } = await supabase
        .from("notifications")
        .insert({
            ...row,
            sender_id: notification.senderId,
            is_read: false,
            is_deleted: false,
        })
        .select()
        .single();
    if (error) {
        console.log(error);
        return err({ kind: 'Infra', message: error.message });
    }
    console.log(data);
    return ok(data as Notification);
}

// 알람 읽기

export async function readNotification(supabase: SupabaseClient, notificationId: NotificationId): Promise<Result<Notification, NotificationRepositoryError>> {
    const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .select()
        .single();
    if (error) {
        return err({ kind: 'NotFound', id: notificationId });
    }
    return ok(data as Notification);
}

// 알람 전체 읽기

export async function allReadNotification(supabase: SupabaseClient): Promise<Result<void, NotificationRepositoryError>> {

    const { user } = await CustomUserAuth(supabase);

    const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .match({ user_id: user.id, is_read: false, is_deleted: false });


    if (error) {
        return err({ kind: 'Infra', message: error.message });
    }
    return ok(undefined);
}

// 알람 삭제
export async function deleteNotification(supabase: SupabaseClient, notificationId: NotificationId): Promise<Result<void, NotificationRepositoryError>> {
    const { user } = await CustomUserAuth(supabase);
    const { error } = await supabase
        .from("notifications")
        .update({ is_deleted: true })
        .eq("id", notificationId)
        .eq("user_id", user.id)
        .select()
        .single();
        
    if (error) {
        return err({ kind: 'Infra', message: error.message });
    }
    return ok(undefined);
}

// 알람 가져오기
export async function myNotifications(supabase: SupabaseClient): Promise<Result<Notification[], NotificationRepositoryError>> {
    const { user } = await CustomUserAuth(supabase);
    const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
    if (error) {
        return err({ kind: 'Infra', message: error.message });
    }
    return ok(data as Notification[]);
}