export enum ChannelType {
    Text = "Текстовый",
    Voice = "Голосовой"
}

export const ChannelTypeByIndex = [ChannelType.Text, ChannelType.Voice];
export const ChannelTypeToValue = (type: ChannelType): number => {
    return type === ChannelType.Text ? 0 : 1;
};

export enum MemberRole {
    ADMIN = "Админ",
    MODERATOR = "Модератор",
    GUEST = "Гость"
}

export interface Profile
{
    id: string;
    userId: string;
    name: string;
    imageUrl: string;
    email: string;

    //servers: Server[];        // use get api/profiles/{profile.id}/getServers
    members: Member[];
    channels: Channel[];

    createdAt: Date;
    updatedAt: Date;
}

export interface Server
{
    id: string;
    name: string;
    imageUrl: string;
    inviteCode: string;

    profileId: string;
    profile: Profile;

    members: Member[];
    channels: Channel[];
    messages: Message[];

    createdAt: Date;
    updatedAt: Date;
}

export interface Member
{   
    id: string;
    role: MemberRole;

    profileId: string;
    profile: Profile;

    serverId: string;
    server: Server;

    messages: Message[];
    directMessages: DirectMessage[];

    conversationsInitiated: Conversation[];
    conversationsReceived: Conversation[];

    createdAt: Date;
    updatedAt: Date;
}

export interface Channel
{   
    id: string;
    name: string;
    type: ChannelType;

    profileId: string;
    profile: Profile;

    serverId: string;
    server: Server;

    createdAt: Date;
    updatedAt: Date;
}

export interface Message
{
    id: string;
    content: string;

    fileUrl?: string;

    member: Member;
    memberId: string;

    channel: Channel;
    channelId: string;

    deleted: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export interface Conversation {
    id: string;

    memberOneId: string;
    memberOne: Member;

    memberTwoId: string;
    memberTwo: Member;

    directMessages: DirectMessage[];
}

export interface DirectMessage {
    id: string;
    content: string;
    fileUrl?: string;

    memberId: string;
    member: Member;

    conversationId: string;
    conversation: Conversation;

    deleted: boolean;

    createdAt: Date;
    updatedAt: Date;
}