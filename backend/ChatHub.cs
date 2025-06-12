using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.SignalR;

public class ChatHub : Hub
{
    private readonly IMessageService _messageService;

    public ChatHub(IMessageService messageService)
    {
        _messageService = messageService;
    }
    // Присоединение к каналу
    public async Task JoinChannel(string serverId, string channelId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, serverId + "/" + channelId);
    }

    // Выход из канала
    public async Task LeaveChannel(string serverId, string channelId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, serverId + "/" + channelId);
    }

    public async Task SendMessage(string serverId, string channelId, string userId, string message)
    {
        CreateMessageRequest request = new()
        {
            OwnerId = Guid.Parse(userId),
            ServerId = Guid.Parse(serverId),
            ChannelId = Guid.Parse(channelId),
            Text = message,
        };

        await Clients.Group(serverId + "/" + channelId).SendAsync("ReceiveMessage", userId, message);
        await _messageService.SaveMessageAsync(request);
    }
}