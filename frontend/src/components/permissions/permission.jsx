/** @format */

import { useEffect, useState } from "react";

const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token"))
      ?.split("=")[1];
    if (token) {
      const permissionIds = token
        .split("-")
        .filter(Boolean)
        .map((id) => id.trim());
      setPermissions(permissionIds);
    }
  }, []);

  const hasPermission = (requiredPermissions) => {
    if (!requiredPermissions) return false; // Handle undefined or null
    if (!Array.isArray(requiredPermissions)) {
      requiredPermissions = [requiredPermissions];
    }
    if (requiredPermissions.length === 0) return true;
    const result = requiredPermissions.some(
      (permission) => permissions.includes(permission?.toString()) // Safe access to toString
    );
    return result;
  };

  const hasAnyFeaturePermission = (features, permissionKey) => {
    if (!Array.isArray(features)) {
      return false;
    }
    return features.some(
      (feature) =>
        hasPermission(feature[permissionKey]) ||
        (Array.isArray(feature.subFeatures) &&
          hasAnyFeaturePermission(feature.subFeatures, permissionKey))
    );
  };

  return { permissions, hasPermission, hasAnyFeaturePermission };
};

export default usePermissions;
