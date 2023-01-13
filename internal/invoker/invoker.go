package invoker

import (
	"os"
	"path/filepath"

	"github.com/glebarez/sqlite"
	"github.com/gotomicro/ego/core/eflag"
	"github.com/gotomicro/ego/server/egin"
	"github.com/spf13/cast"
	"gorm.io/gorm"

	"k8z/internal/ui"
)

var (
	Gin *egin.Component
	DB  *gorm.DB
)

func Init() error {
	Gin = egin.Load("server.http").Build(egin.WithEmbedFs(ui.WebUI), egin.WithPort(cast.ToInt(eflag.String("port"))))
	homeDir, _ := os.UserHomeDir()
	profileDir := filepath.Join(homeDir, ".k8z")
	err := os.MkdirAll(profileDir, os.ModePerm)
	if err != nil {
		return err
	}
	db, err := gorm.Open(sqlite.Open(filepath.Join(profileDir, "database.db")), &gorm.Config{})
	if err != nil {
		return err
	}
	DB = db
	return nil
}
