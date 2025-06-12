using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Server> Servers { get; set; }
    public DbSet<Channel> Channels { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Настройка уникальности InviteCode
        modelBuilder.Entity<Server>()
            .HasIndex(s => s.InviteCode)
            .IsUnique();
    }
}