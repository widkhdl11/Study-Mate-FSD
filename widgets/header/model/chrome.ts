'use client'

import { createContext, useContext } from 'react'

/**
 * 헤더 크롬(로고·nav·트리거)의 투명/솔리드 상태를 자식에게 내려주는 컨텍스트.
 * 홈 히어로 위 투명 상태에서 자식들이 흰색으로 뒤집히도록 프롭 쓰레딩 없이 공유한다.
 * 기본값 transparent=false → 헤더 밖에서 쓰여도 안전(솔리드).
 */
export const HeaderChromeContext = createContext<{ transparent: boolean }>({
    transparent: false,
})

export const useHeaderChrome = () => useContext(HeaderChromeContext)
