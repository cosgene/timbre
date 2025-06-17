using Microsoft.AspNetCore.SignalR;

public class VoiceHub : Hub
{
    private static readonly Dictionary<string, VoiceUser> Users = new();

    public async Task JoinVoiceChannel(string channelId)
    {
        // Регистрация пользователя
        Users[Context.ConnectionId] = new VoiceUser
        {
            ConnectionId = Context.ConnectionId,
            ChannelId = channelId
        };

        await Groups.AddToGroupAsync(Context.ConnectionId, channelId);

        var existingUsers = Users.Values
        .Where(u => u.ChannelId == channelId && u.ConnectionId != Context.ConnectionId)
        .Select(u => u.ConnectionId)
        .ToList();

        await Clients.Caller.SendAsync("ExistingUsers", existingUsers);

        await Clients.Group(channelId).SendAsync("UserJoined", Context.ConnectionId, true);
    }

    public async Task LeaveVoiceChannel()
    {
        if (Users.TryGetValue(Context.ConnectionId, out var user))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, user.ChannelId);
            await Clients.Group(user.ChannelId).SendAsync("UserLeft", Context.ConnectionId);
            Users.Remove(Context.ConnectionId);
        }
    }

    public async Task SendAudioChunk(byte[] audioData)
    {
        //var audioData = Convert.FromBase64String(base64Data);

        if (Users.TryGetValue(Context.ConnectionId, out var user))
        {
            await Clients.OthersInGroup(user.ChannelId)
                .SendAsync("ReceiveAudio", Context.ConnectionId, audioData);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await LeaveVoiceChannel();
        await base.OnDisconnectedAsync(exception);
    }

    public async Task AddMe(string userId)
    {
        await Clients.Others.SendAsync("AddUser", userId);
    }
}

public class VoiceUser
{
    public string ConnectionId { get; set; } = string.Empty;
    public string ChannelId { get; set; } = string.Empty;
}


// // VoiceHub.cs
// 
// public class VoiceHub : Hub
// {
//     // Словарь для отслеживания пользователей в каналах
//     private static readonly Dictionary<string, string> UserRooms = new();
    
//     // Присоединение к голосовому каналу
//     public async Task JoinVoiceChannel(string serverId, string channelId)
//     {
//         var roomName = GetRoomName(serverId, channelId);
//         UserRooms[Context.ConnectionId] = roomName;
        
//         await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
//         await Clients.OthersInGroup(roomName).SendAsync("UserJoined", Context.ConnectionId);
//     }

//     // Выход из голосового канала
//     public async Task LeaveVoiceChannel()
//     {
//         if (UserRooms.TryGetValue(Context.ConnectionId, out var roomName))
//         {
//             await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
//             await Clients.OthersInGroup(roomName).SendAsync("UserLeft", Context.ConnectionId);
//             UserRooms.Remove(Context.ConnectionId);
//         }
//     }

//     // Отправка WebRTC сигнала конкретному пользователю
//     public async Task SendSignal(string targetConnectionId, string signal)
//     {
//         await Clients.Client(targetConnectionId).SendAsync("ReceiveSignal", 
//             Context.ConnectionId, 
//             signal
//         );
//     }

//     // Отправка аудио-потока в комнату
//     public async Task SendAudioStream(byte[] audioData)
//     {
//         if (UserRooms.TryGetValue(Context.ConnectionId, out var roomName))
//         {
//             await Clients.OthersInGroup(roomName).SendAsync("ReceiveAudio", 
//                 Context.ConnectionId,
//                 audioData
//             );
//         }
//     }

//     private static string GetRoomName(string serverId, string channelId) 
//         => $"voice_{serverId}_{channelId}";
// }