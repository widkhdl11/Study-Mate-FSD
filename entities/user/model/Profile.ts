import { Brand } from "@/shared/kernel/Id";
import { err, ok, Result } from "@/shared/kernel/Result";
import { Gender, isGender } from "./Gender";
import { UserId, UserIdError } from "./UserId";

export type ProfileError =
| { readonly kind: "EmptyValue" , cause: string }
| { readonly kind: "InvalidValue" , cause: string }
| UserIdError

export type Profile = Brand<
    Readonly<{
        id: UserId;
        username: string;
        email: string;
        points: number;
        gender: Gender;
        birthDate: Date;
        bio: string;
        avatarUrl: string;
        createdAt: Date;
        updatedAt: Date;
    }>,
    "Profile"
>;


export type ProfileRow = {
    id: string;
    username: string;
    email: string;
    points: number;
    gender: string;
    birth_date: string;
    bio: string;
    avatar_url: string;
    created_at: string;
    updated_at: string;
}

type ProfileProps ={
    id: UserId;
    username: string;
    email: string;
    points: number;
    gender: Gender;
    birthDate: Date;
    bio: string;
    avatarUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

const construct = (params: ProfileProps): Result<Profile, ProfileError> => {
    if (params.username.trim() === "") return err({ kind: "EmptyValue", cause: "username" });
    if (params.email.trim() === "") return err({ kind: "EmptyValue", cause: "email" });
    if (params.points < 0) return err({ kind: "InvalidValue", cause: "points" });
    if (params.gender.trim() === "") return err({ kind: "InvalidValue", cause: "gender" });
    if (params.birthDate.getTime() < 0) return err({ kind: "InvalidValue", cause: "birthDate" });
    if (params.bio.trim() === "") return err({ kind: "EmptyValue", cause: "bio" });
    return ok({
        id: params.id,
        username: params.username,
        email: params.email,
        points: params.points,
        gender: params.gender,
        birthDate: params.birthDate,
        bio: params.bio,
        avatarUrl: params.avatarUrl,
        createdAt: params.createdAt,
        updatedAt: params.updatedAt,
    } as Profile);
}

export const Profile = {
    create: construct,

    fromRow: (row: ProfileRow): Result<Profile, ProfileError> => {
        const idResult = UserId.of(row.id);
        if (!idResult.ok) return idResult;
        if (!isGender(row.gender)) return err({ kind: "InvalidValue", cause: "gender" });
        return ok({
            id: idResult.value,
            username: row.username,
            email: row.email,
            points: row.points,
            gender: row.gender,
            birthDate: new Date(row.birth_date),
            bio: row.bio,
            avatarUrl: row.avatar_url,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        } as Profile);
    },
    
    toRow: (p: Profile): ProfileRow => ({
        id: p.id,
        username: p.username,
        email: p.email,
        points: p.points,
        gender: p.gender,
        birth_date: p.birthDate.toISOString(),
        bio: p.bio,
        avatar_url: p.avatarUrl,
        created_at: p.createdAt.toISOString(),
        updated_at: p.updatedAt.toISOString(),
    }),


}