import { useEffect, useState } from "react";

const isServer = typeof document === "undefined";
export function useFacebookButton({
  appId,
  version = 2.8,
  scope = "public_profile,email,user_birthday,user_link"
}) {
  let [isSdkLoaded, setSdkLoadedState] = useState(false);
  let [clicked, setClicked] = useState(false);
  let _isMounted = useRef();
  useEffect(() => {
    _isMounted.current = true;
    if (!isServer) {
      if (document.getElementById("facebook-jssdk")) {
        setSdkLoadedState(true);
        return;
      }
      setFbAsyncInit();
      loadSdkAsync();
      let fbRoot = document.getElementById("fb-root");
      if (!fbRoot) {
        fbRoot = document.createElement("div");
        fbRoot.id = "fb-root";
        document.body.appendChild(fbRoot);
      }
    }
  }, []);
  function setFbAsyncInit() {
    window.fbAsyncInit = () => {
      window.FB.init({
        version: `v${version}`,
        appId,
        xfbml: true,
        cookie: true
      });
      setSdkLoadedState(true);
      window.FB.getLoginStatus();
    };
  }

  function onLogin(postLogin, onError) {
    setClicked(true);
    if (!!window.FB) {
      window.FB.login(
        response => checkLoginAfterRefresh(response, postLogin, onError),
        {
          scope
        }
      );
    }
  }
  function checkLoginAfterRefresh(response, postLogin, onError = () => {}) {
    console.log("statusChangeCallback");
    console.log(response);
    if (response.status === "connected") {
      postLogin(response);
    } else {
      onError();
      // The person is not logged into your app or we are unable to tell.
      console.log("not logged in");
    }
  }
  function loadSdkAsync() {
    (function(d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }
  return { isSdkLoaded, onLogin, clicked };
}
