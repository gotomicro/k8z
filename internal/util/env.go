package util

import (
	"github.com/gotomicro/ego/core/eflag"
)

func IsRunModeElectron() bool {
	return eflag.String("mode") == "electron"
}
