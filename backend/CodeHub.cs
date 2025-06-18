using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.SignalR;

public class CodeHub : Hub
{
    private static readonly Dictionary<string, HashSet<string>> SessionUsers = new();

    public CodeHub()
    {

    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        foreach (var group in SessionUsers.Keys.ToList())
        {
            SessionUsers[group].Remove(Context.ConnectionId);
            if (SessionUsers[group].Count == 0)
                SessionUsers.Remove(group);
        }
        return base.OnDisconnectedAsync(exception);
    }

    // Присоединение к каналу
    public async Task JoinCodeSession(string serverId, string channelId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, serverId + "/" + channelId);

        if (!SessionUsers.ContainsKey(serverId + "/" + channelId))
            SessionUsers[serverId + "/" + channelId] = new HashSet<string>();

        SessionUsers[serverId + "/" + channelId].Add(Context.ConnectionId);
    }

    // Выход из канала
    public async Task LeaveCodeSession(string serverId, string channelId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, serverId + "/" + channelId);
    }

    public class CodeChange
    {
        public Range Range { get; set; }
        public string Text { get; set; } = string.Empty;
    }

    public class Range
    {
        public int StartLineNumber { get; set; }
        public int StartColumn { get; set; }
        public int EndLineNumber { get; set; }
        public int EndColumn { get; set; }
    }


    public async Task SendCodeDelta(string serverId, string channelId, List<CodeChange> changes)
    {
        await Clients.OthersInGroup(serverId + "/" + channelId).SendAsync("ReceiveCodeDelta", changes);
    }

    public Task<List<string>> GetSessionUsers(string serverId, string channelId)
    {
        if (SessionUsers.TryGetValue(serverId + "/" + channelId, out var users))
            return Task.FromResult(users.ToList());

        return Task.FromResult(new List<string>());
    }

    public async Task RequestSyncCode(string serverId, string channelId)
    {
        // Отправить одному из других участников запрос
        var others = SessionUsers.GetValueOrDefault(serverId + "/" + channelId)?.Where(c => c != Context.ConnectionId).ToList();
        if (others != null && others.Count > 0)
        {
            var target = others.First();
            await Clients.Client(target).SendAsync("SyncCodeTo", Context.ConnectionId);
        }
    }

    public async Task SendFullCodeTo(string connectionId, string code, string language)
    {
        await Clients.Client(connectionId).SendAsync("ReceiveSyncCode", code, language);
    }
    
    public async Task SendLanguageChange(string serverId, string channelId, string language)
    {
        await Clients.OthersInGroup(serverId + "/" + channelId).SendAsync("ReceiveLanguageChange", language);
    }


}