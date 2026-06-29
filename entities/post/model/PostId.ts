import type { Brand } from "@/shared/kernel/Id";
import { err, ok, type Result } from "@/shared/kernel/Result";

export type PostId = Brand<number, "PostId">

export type PostIdError = 
{ readonly kind : "NotPositiveInteger" ; readonly value : number };


const construct = (value : number) : Result<PostId, PostIdError> => {
    if ( !Number.isInteger(value) || value <= 0 ) {
        return err({ kind : "NotPositiveInteger" , value });
    }
    return ok(value as PostId)
};


export const PostId = {
    of: construct,
    toString: (id : PostId) : string => String(id),
    fromString: (s: string) : Result<PostId, PostIdError> => {
        const n = Number.parseInt(s,10)
        return construct(n)
    } 
}

