package service

import (
	"flag"
	"testing"

	"github.com/gotomicro/ego"

	"k8z/internal/invoker"
)

func TestMain(m *testing.M) {
	flag.String("config", "../../config/ut.toml", "")
	_ = ego.New(ego.WithDisableFlagConfig(true), ego.WithHang(false)).
		Invoker(invoker.Init).
		Invoker(Init).
		Invoker(func() error {
			m.Run()
			return nil
		}).Run()
}
