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

    public async Task SendMessage(string serverId, string channelId, Member member, string message)
    {
        try
        {
            //Console.WriteLine("got " + serverId + " " + channelId + " " + userId + " " + message);
            // CreateMessageRequest request = new()
            // {
            //     OwnerId = member.Id,
            //     ServerId = Guid.Parse(serverId),
            //     ChannelId = Guid.Parse(channelId),
            //     Content = message,
            // };

            var msg = new Message
            {
                Id = Guid.NewGuid(),
                Member = member,
                MemberId = member.Id,
                ChannelId = Guid.Parse(channelId),
                Content = message,
                FileUrl = "",

                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await Clients.Group(serverId + "/" + channelId).SendAsync("ReceiveMessage", msg);
            await _messageService.SaveMessageAsync(msg);
        }
        catch (Exception ex)
        {
            Console.WriteLine("[SignalR Error on SendMessage] " + ex.Message);
            Console.WriteLine(ex.StackTrace);
            throw;
        }
    }

    public async Task EditMessage(string serverId, string channelId, string msgId, string newMessage)
    {
        try
        {

            await Clients.Group(serverId + "/" + channelId).SendAsync("ReceiveEditMessage", msgId, newMessage);
            await _messageService.SaveEditMessageAsync(Guid.Parse(msgId), newMessage);
        }
        catch (Exception ex)
        {
            Console.WriteLine("[SignalR Error on EditMessage] " + ex.Message);
            Console.WriteLine(ex.StackTrace);
            throw;
        }
    }

    public async Task DeleteMessage(string serverId, string channelId, string msgId)
    {
        try
        {

            await Clients.Group(serverId + "/" + channelId).SendAsync("ReceiveDeleteMessage", msgId);
            await _messageService.SaveDeleteMessageAsync(Guid.Parse(msgId));
        }
        catch (Exception ex)
        {
            Console.WriteLine("[SignalR Error on DeleteMessage] " + ex.Message);
            Console.WriteLine(ex.StackTrace);
            throw;
        }
    }
}