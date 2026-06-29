import type { Brand } from "@/shared/kernel/Id";
import { err, ok, type Result } from "@/shared/kernel/Result";

export type ParticipantId = Brand<number, "ParticipantId">


export type ParticipantIdError = 
{ readonly kind : "NotPositiveInteger", readonly value : number }



const construct = (value : number) : Result<ParticipantId,ParticipantIdError> => {
    if ( !Number.isInteger(value) || value <= 0 ){
        return err({kind:"NotPositiveInteger", value})
    }
    return ok(value as ParticipantId)
}

export const ParticipantId = {
    of: construct,
    toString: (id : ParticipantId) : string => String(id),
    fromString: (s: string) : Result<ParticipantId, ParticipantIdError> => {
        const n = Number.parseInt(s,10)
        return construct(n)
    } 
}