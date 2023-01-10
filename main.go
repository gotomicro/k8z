package main

import (
	"github.com/gotomicro/ego"
	"github.com/gotomicro/ego/core/eflag"
	"github.com/gotomicro/ego/core/elog"

	"k8z/internal/invoker"
	"k8z/internal/router"
	"k8z/internal/service"
)

func main() {
	eflag.Register(&eflag.IntFlag{
		Name:    "port",
		Usage:   "--port",
		EnvVar:  "K8Z_PORT",
		Default: 9001,
		Action:  func(string, *eflag.FlagSet) {},
	})
	eflag.Register(&eflag.StringFlag{
		Name:    "mode",
		Usage:   "--mode",
		EnvVar:  "K8Z_MODE",
		Default: "electron",
		Action:  func(string, *eflag.FlagSet) {},
	})
	err := ego.New().
		Invoker(
			invoker.Init,
			service.Init,
		).
		Serve(router.Server()).
		Run()
	if err != nil {
		elog.Panic("start up error: " + err.Error())
	}
}
