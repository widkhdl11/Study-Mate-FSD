import { err, ok, Result } from "@/shared/kernel/Result";
import { SupabaseClient } from "@supabase/supabase-js";
import { NotificationView, selectedNotificationRow } from "./types";


export type QueryMyNotificationError =
    | { readonly kind: "Infra"; readonly message: string };

function toView(notification: selectedNotificationRow[]): NotificationView[] {
    return notification.map((notification) => ({
        id: notification.id,
        userId: notification.user_id,
        createdAt: notification.created_at,
        type: notification.type,
        title: notification.title,
        content: notification.content,
        isRead: notification.is_read,
        isDeleted: notification.is_deleted,
        referenceType: notification.reference_type,
        referenceId: notification.reference_id,
        senderId: notification.sender_id,
        sender: {
            username: notification.sender.username,
            avatarUrl: notification.sender.avatar_url ?? "",
        },
    }));
}

export async function queryMyNotification(
    supabase: SupabaseClient,
    userId: string
): Promise<Result<NotificationView[], QueryMyNotificationError>> {
    const { data, error } = await supabase
        .from("notifications")
        .select("*, sender:profiles!notifications_sender_id_fkey(username, avatar_url)")
        .eq("user_id", userId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

    if (error) {
        return err({ kind: "Infra", message: error.message });
    }

    const selectedNotificationRows = data as selectedNotificationRow[];
    return ok(toView(selectedNotificationRows));
}
