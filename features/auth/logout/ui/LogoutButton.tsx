import { Button } from "@/shared/shadcn/ui/button"
import { LogOut } from "lucide-react"
import { useLogout } from "../model/useLogout"

export default function LogoutButton() {
    const logoutMutation = useLogout()

    return (
         <Button
            variant='outline'
            className='gap-2 bg-transparent'
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}>
            <LogOut className='w-4 h-4' />
            로그아웃
        </Button>
    )
}