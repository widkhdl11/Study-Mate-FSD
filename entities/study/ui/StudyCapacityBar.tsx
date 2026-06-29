
export function StudyCapacityBar({current, max}: {current: number, max: number}) {
    return (
        <div className="w-full bg-muted rounded-full h-2">
        <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{
            width: `${
                (current / max) * 100
            }%`,
            }}
        />
        </div>
    )
}