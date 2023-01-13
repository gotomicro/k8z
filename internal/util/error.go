package util

import (
	"fmt"
)

type DepError struct {
	Dependency string `json:"dependency"`
	Refer      string `json:"refer"`
}

type DepErrors []DepError

func (de DepError) Error() string {
	if de.Refer == "" {
		return fmt.Sprintf("dependency [%s] missing", de.Dependency)
	}
	return fmt.Sprintf("dependency [%s] missing, please refer to %s to solve this issue", de.Dependency, de.Refer)
}

func (des DepErrors) Error() string {
	var str string
	for _, de := range des {
		str += de.Error()
		str += "\n"
	}
	return str[:len(str)-1]
}
