import { Brand } from "@/shared/kernel/Id";
import { err, ok, Result } from "@/shared/kernel/Result";

export type NotificationId = Brand<number, "NotificationId">;

export type NotificationIdError = 
{ readonly kind : "NotPositiveInteger", readonly value : number }

const construct = (value : number) : Result<NotificationId,NotificationIdError> => {
    if ( !Number.isInteger(value) || value <= 0 ){
        return err({kind:"NotPositiveInteger", value})
    }
    return ok(value as NotificationId)
}

export const NotificationId = {
    of: construct,
    toString: (id : NotificationId) : string => String(id),
    fromString: (s: string) : Result<NotificationId, NotificationIdError> => {
        const n = Number.parseInt(s, 10)
        return construct(n)
    },
}