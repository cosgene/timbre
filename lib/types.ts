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

export default class Message
{
    // TODO
}