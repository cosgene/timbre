export const getOrCreateConversation = async (memberOneId: string, memberTwoId: string) => {
    let conversation = await findConversation(memberOneId, memberTwoId) || await findConversation(memberTwoId, memberOneId);

    if (!conversation) {
        conversation = await createNewConversation(memberOneId, memberTwoId);
    }

    console.log('[getOrCreateConversation]@/lib/conversations.ts', memberOneId, memberTwoId)
    return conversation;
}

const findConversation = async (memberOneId: string, memberTwoId: string) => {
    try {
    // TODO
    // найти conversation где id двух участников из параметров совпадает с id
    // участников в conversation и вернуть этот объект
    } catch {
        return null;
    }
}

const createNewConversation = async (memberOneId: string, memberTwoId: string) => {
    try {
    // TODO
    // создать conversation с двумя id из параметров
    // и вернуть
    } catch {
        return null;
    }
}