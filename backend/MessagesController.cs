using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{ 
    private readonly AppDbContext _context;
    private readonly ILogger<MessagesController> _logger;

    public MessagesController(AppDbContext context, ILogger<MessagesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Message>> GetMessage(Guid id)
    {
        var message = await _context.Messages
            .FirstOrDefaultAsync(s => s.Id == id);

        if (message == null) return NotFound();
        return message;
    }

    [HttpPost("send")]
    public async Task<IActionResult> CreateMessage(CreateMessageRequest request)
    {
        try
        {

            // Создание сервера
            var message = new Message
            {
                Id = Guid.NewGuid(),
                OwnerId = request.OwnerId,
                ServerId = request.ServerId,
                ChannelId = request.ChannelId,
                Text = request.Text,
            };

            // Сохранение в БД
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Возвращаем созданный объект
            return CreatedAtAction(nameof(GetMessage), new { id = message.Id }, message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating message");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{serverId}/{channelId}")]
    public async Task<ActionResult<List<Message>>> GetChannelMessages(Guid serverId, Guid channelId)
    {
        var msgs = await _context.Messages
                    .Where(s => s.ServerId == serverId && s.ChannelId == channelId)
                    .ToListAsync();

        return msgs;
    }
}

