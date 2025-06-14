public class Profile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageURL { get; set; } = "/";
    public string Email { get; set; } = string.Empty;

    public List<Server> Servers { get; set; } = new();
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
    public MemberRole Role { get; set; } = MemberRole.GUEST;
    public Guid ProfileId { get; set; }
    public Guid ServerId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class ChannelRequest
{
    public string Name { get; set; } = string.Empty;
    public ChannelType Type { get; set; }
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
    public ChannelType Type { get; set; }
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

public class CreateMessageRequest
{
    public Guid OwnerId { get; set; }
    public Guid ServerId { get; set; }
    public Guid ChannelId { get; set; }
    public string Text { get; set; } = string.Empty;
}

public class Message
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public Guid ServerId { get; set; }
    public Guid ChannelId { get; set; }
    public string Text { get; set; } = string.Empty;
}