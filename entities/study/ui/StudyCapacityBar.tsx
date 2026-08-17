
export function StudyCapacityBar({current, max}: {current: number, max: number}) {
    return (
        <div className="w-full bg-ink/10 rounded-full h-2">
        <div
            className="bg-hl-coral h-2 rounded-full transition-all"
            style={{
            width: `${
                (current / max) * 100
            }%`,
            }}
        />
        </div>
    )
}