import type { Brand } from "@/shared/kernel/Id";
import { err, ok, type Result } from "@/shared/kernel/Result";

export type UserId = Brand<string, "UserId">

export type UserIdError = 
|{ readonly kind : "Empty" }
| { readonly kind : "InvalidUuid", readonly value : string }
| { readonly kind : "NotSelf", readonly id: UserId, readonly actorId: UserId };

const construct = (value : string) : Result<UserId, UserIdError> => {
    if ( value.trim() === "" ) {
        return err({kind:"Empty"})
    }
    const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if ( !UUID_REGEX.test(value) ){
        return err({kind : "InvalidUuid", value})
    }
    return ok(value as UserId)
}


export const UserId = {
    of : construct,

    // 본인 체크
    isSelf: (id: UserId, actorId: UserId): Result<void, UserIdError> => {
        if (id !== actorId) {
            return err({ kind: "NotSelf", id, actorId });
        }
        return ok(undefined);
    },
    equals: (id: UserId, actorId: UserId): boolean => {
        return id === actorId;
    },
}