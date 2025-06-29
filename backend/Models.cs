public class CreateProfileRequest
{
    public string ClerkId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string ImageURL { get; set; } = "/";
    public string Email { get; set; } = string.Empty;
}

public class Profile
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;  // Clerk ID
    public string Name { get; set; } = string.Empty;
    public string ImageURL { get; set; } = "/";
    public string Email { get; set; } = string.Empty;

    //public List<Server> Servers { get; set; } = new();
    public List<Member> Members { get; set; } = new();
    public List<Channel> Channels { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum MemberRole {
    ADMIN,
    MODERATOR,
    GUEST
}

public class Member
{
    public Guid Id { get; set; }
    public string Role { get; set; } = "Гость";
    public required Profile Profile { get; set; }
    public Guid ProfileId { get; set; }
    public Server Server { get; set; }
    public Guid ServerId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class ChannelRequest
{
    public string Name { get; set; } = string.Empty;
    public ChannelType Type { get; set; }
}

public class CreateChannelRequest
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "Текстовый";
    public Guid ProfileId { get; set; }
    public Guid ServerId { get; set; }
}

public enum ChannelType
{
    Text,
    Voice
}

public class Channel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "Текстовый";
    public Guid ProfileId { get; set; }
    public Guid ServerId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class CreateServerRequest
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public Guid InviteCode { get; set; }
    public List<ChannelRequest> Channels { get; set; } = new();
}

public class Server
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public Guid InviteCode { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<Channel> Channels { get; set; } = new();
    public List<Member> Members { get; set; } = new();
}

public class EditServerRequest
{
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
}

public class EditChannelRequest
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}

public class EditProfileRequest
{
    public string Name { get; set; } = string.Empty;
}
public class EditMemberRequest
{
    public string Role { get; set; } = "Гость";
}

public class JoinInvitationRequest
{
    public Guid profileId { get; set; }
}

public class CreateMessageRequest
{
    public Guid OwnerId { get; set; }
    public Guid ServerId { get; set; }
    public Guid ChannelId { get; set; }
    public string Content { get; set; } = string.Empty;
}

public class Message
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public string FileUrl { get; set; }
    public Member Member { get; set; }
    public Guid MemberId { get; set; }
    public Channel Channel { get; set; }
    public Guid ChannelId { get; set; }
    public bool Deleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // public Member Member { get; set; }
    // public Guid OwnerId { get; set; }
    // public Guid ServerId { get; set; }
    // public Guid ChannelId { get; set; }
    // public string Text { get; set; } = string.Empty;
}

public class DirectMessage
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public string FileUrl { get; set; }
    public Member Member { get; set; }
    public Guid MemberId { get; set; }
    public Conversation Conversation { get; set; }
    public Guid ConversationId { get; set; }
    public bool Deleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // public Member Member { get; set; }
    // public Guid OwnerId { get; set; }
    // public Guid ServerId { get; set; }
    // public Guid ChannelId { get; set; }
    // public string Text { get; set; } = string.Empty;
}

public class Conversation
{
    public Guid Id { get; set; }
    public Member MemberOne { get; set; }
    public Guid MemberOneId { get; set; }
    public Member MemberTwo { get; set; }
    public Guid MemberTwoId { get; set; }
    public List<DirectMessage> DirectMessages { get; set; } = [];
}

public class CreateCodeRequest
{
    public Guid ServerId { get; set; }
    public Guid ChannelId { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Language { get; set; } = "typescript";
}
public class Code
{
    public Guid Id { get; set; }
    public Guid ServerId { get; set; }
    public Guid ChannelId { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Language { get; set; } = "typescript";
}