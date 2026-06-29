import { getRegionPathByValue } from "@/shared/config/region";
import { MapPin } from "lucide-react";

export function StudyRegionLabel({region}: {region: string}) {  
    return (
    <span className="text-sm text-muted-foreground flex items-center gap-1">
    <MapPin className="w-4 h-4" /> 
        {getRegionPathByValue(region).labels.join(" ")}
    </span>
    )
}   