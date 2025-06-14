using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Server> Servers { get; set; }
    public DbSet<Channel> Channels { get; set; }
    public DbSet<Profile> Profiles { get; set; }
    public DbSet<Member> Members { get; set; }
    public DbSet<Message> Messages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Настройка уникальности полей
        modelBuilder.Entity<Server>()
            .HasIndex(s => s.Id)
            .IsUnique();
        modelBuilder.Entity<Channel>()
            .HasIndex(s => s.Id)
            .IsUnique();
        modelBuilder.Entity<Message>()
            .HasIndex(s => s.Id)
            .IsUnique();
    }
}