public class CreateServerRequest
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public Guid InviteCode { get; set; }
    public List<ChannelRequest> Channels { get; set; } = new();
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

public class Server
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public Guid InviteCode { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<Channel> Channels { get; set; } = new();
}

public class Channel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public ChannelType Type { get; set; }
    public Guid ServerId { get; set; }
}