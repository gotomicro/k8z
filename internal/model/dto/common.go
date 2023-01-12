package dto

import (
	"k8z/internal/util"
)

type CheckDependenciesResponse struct {
	Success          bool           `json:"success"`
	DependencyErrors util.DepErrors `json:"dependency_errors"`
}
