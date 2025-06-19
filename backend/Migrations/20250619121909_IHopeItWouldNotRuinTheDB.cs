using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class IHopeItWouldNotRuinTheDB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Servers_Profiles_ProfileId",
                table: "Servers");

            migrationBuilder.DropIndex(
                name: "IX_Servers_ProfileId",
                table: "Servers");

            migrationBuilder.DropColumn(
                name: "ProfileId",
                table: "Servers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ProfileId",
                table: "Servers",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Servers_ProfileId",
                table: "Servers",
                column: "ProfileId");

            migrationBuilder.AddForeignKey(
                name: "FK_Servers_Profiles_ProfileId",
                table: "Servers",
                column: "ProfileId",
                principalTable: "Profiles",
                principalColumn: "Id");
        }
    }
}
