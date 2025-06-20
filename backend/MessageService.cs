using Microsoft.EntityFrameworkCore;

public interface IMessageService
{
    Task SaveMessageAsync(Message msg);
    Task SaveEditMessageAsync(Guid messageId, string newMessage);
    Task SaveDeleteMessageAsync(Guid messageId);
}

public class MessageService : IMessageService
{
    private readonly AppDbContext _dbContext;

    public MessageService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // saves message to database
    // public async Task SaveMessageAsync(CreateMessageRequest request)
    // {
    //     var member = _dbContext.Members
    //         .FirstOrDefault(s => s.Id == request.OwnerId);

    //     if (member == null) return;

    //     // Создание сервера
    //     var message = new Message
    //     {
    //         Id = Guid.NewGuid(),
    //         Member = member,
    //         MemberId = member.Id,
    //         ChannelId = request.ChannelId,
    //         Content = request.Content,

    //         CreatedAt = DateTime.UtcNow,
    //         UpdatedAt = DateTime.UtcNow
    //     };

    //     // Сохранение в БД
    //     _dbContext.Messages.Add(message);
    //     await _dbContext.SaveChangesAsync();
    // }

    public async Task SaveMessageAsync(Message msg)
    {
        var trackedMember = await _dbContext.Members.FindAsync(msg.MemberId);
        msg.Member = trackedMember;

        // Сохранение в БД
        _dbContext.Messages.Add(msg);
        await _dbContext.SaveChangesAsync();
    }
    public async Task SaveEditMessageAsync(Guid messageId, string newMessage)
    {
        var message = await _dbContext.Messages.FirstOrDefaultAsync(s => s.Id == messageId);
        if (message == null) return;

        message.Content = newMessage;

        // Сохранение в БД
        await _dbContext.SaveChangesAsync();
    }
    public async Task SaveDeleteMessageAsync(Guid messageId)
    {
        var message = await _dbContext.Messages.FirstOrDefaultAsync(s => s.Id == messageId);
        if (message == null) return;

        _dbContext.Messages.Remove(message);

        // Сохранение в БД
        await _dbContext.SaveChangesAsync();
    }
}