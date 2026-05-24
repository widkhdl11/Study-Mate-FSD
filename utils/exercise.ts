// 전역 변수들 — 모듈 외부
let comments: any[] = [];
let currentUser: any = null;
let commentIdCounter = 1;

// 모든 함수가 외부 변수 직접 조작
function login(name: string, role: string) {
    currentUser = { name, role }; 
}

function logout() {
    currentUser = null;
}

function addComment(content: string) {
    // 인증 체크
    if (!currentUser) {
        alert('로그인이 필요합니다');
        return;
    }
    
    // 검증
    if (content.length < 2) {
        alert('댓글은 2자 이상 입력하세요');
        return;
    }
    if (content.length > 500) {
        alert('댓글은 500자 이하로 작성하세요');
        return;
    }
    
    // 금지어 체크
    const banned = ['욕설1', '욕설2', '광고'];
    for (const word of banned) {
        if (content.includes(word)) {
            alert('금지어가 포함되어 있습니다');
            return;
        }
    }
    
    // 권한 체크
    let canPost = false;
    if (currentUser.role === 'admin') canPost = true;
    if (currentUser.role === 'user') canPost = true;
    if (currentUser.role === 'guest') canPost = false;
    
    if (!canPost) {
        alert('권한이 없습니다');
        return;
    }
    
    // 댓글 추가
    const comment = {
        id: commentIdCounter++,
        author: currentUser.name,
        content: content,
        createdAt: new Date(),
        likes: 0,
    };
    comments.push(comment);
}

function likeComment(commentId: number) {
    if (!currentUser) {
        alert('로그인이 필요합니다');
        return;
    }
    
    for (let i = 0; i < comments.length; i++) {
        if (comments[i].id === commentId) {
            comments[i].likes++;
            break;
        }
    }
}

function deleteComment(commentId: number) {
    if (!currentUser) {
        alert('로그인이 필요합니다');
        return;
    }
    
    // 권한: 본인 댓글 or 관리자
    let comment = null;
    for (let i = 0; i < comments.length; i++) {
        if (comments[i].id === commentId) {
            comment = comments[i];
            break;
        }
    }
    
    if (!comment) return;
    
    if (comment.author !== currentUser.name && currentUser.role !== 'admin') {
        alert('삭제 권한이 없습니다');
        return;
    }
    
    comments = comments.filter(c => c.id !== commentId);
}

function getComments() {
    return comments;
}

// 사용
login('홍길동', 'user');
addComment('첫 댓글입니다');
likeComment(1);