public interface IMessageService
{
    Task SaveMessageAsync(CreateMessageRequest request);
}

public class MessageService : IMessageService
{
    private readonly AppDbContext _dbContext;

    public MessageService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // saves message to database
    public async Task SaveMessageAsync(CreateMessageRequest request)
    {
        var message = new Message
        {
            Id = Guid.NewGuid(),
            OwnerId = request.OwnerId,
            ServerId = request.ServerId,
            ChannelId = request.ChannelId,
            Text = request.Text,
        };

        // Сохранение в БД
        _dbContext.Messages.Add(message);
        await _dbContext.SaveChangesAsync();
    }
}