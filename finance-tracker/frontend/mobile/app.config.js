export default {
  "expo": {
    "name": "BudJet",
    "slug": "budjet",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "bundleIdentifier": "com.budjet.app",
      "supportsTablet": true,
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.budjet.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      // 🔧 UPDATED: Allineato al web frontend
      "API_URL": process.env.API_URL || "https://bud-jet-be.netlify.app/.netlify/functions/api",
      "eas": {
        "projectId": "c9c84e26-5b01-41ce-9f35-8927f38e8e2c"
      }
    }
  }
}; 