import { useEffect, useState } from "react";

const isServer = typeof document === "undefined";

export function useGoogleButton({ client_id, scope }) {
  let [clicked, setClicked] = useState(false);
  let [disabled, setDisabled] = useState(true);
  let buttonRef = useRef();
  useEffect(() => {
    if (!isServer) {
      ((d, s, id, callback) => {
        let js,
          gs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
          setDisabled(false);
        } else {
          js = d.createElement(s);
          js.id = id;
          js.src = "https://apis.google.com/js/platform.js";
          gs.parentNode.insertBefore(js, gs);
          js.onload = callback;
        }
      })(document, "script", "google-platform", () => {
        window.gapi.load("auth2", () => {
          setDisabled(false);
          if (!window.gapi.auth2.getAuthInstance()) {
            let options = {
              client_id,
              cookiepolicy: "single_host_origin"
            };
            if (scope) {
              options.scope = scope;
            }
            let auth2 = window.gapi.auth2.init(options);
            if (buttonRef.current) {
              attachSignin(auth2);
            }
          }
        });
      });
    }
  }, []);
  function attachSignin(auth2) {
    let element = buttonRef.current;
    auth2.attachClickHandler(
      element,
      {},
      function(googleUser) {
        console.log("Signed in: " + googleUser.getBasicProfile().getName());
      },
      function(error) {
        console.log(JSON.stringify(error, undefined, 2));
      }
    );
  }
  const clickHandler = (postLogin = () => {}, onError = () => {}) => {
    if (Boolean(window.gapi)) {
      const auth2 = window.gapi.auth2.getAuthInstance();
      if (Boolean(auth2)) {
        auth2
          .signIn()
          .then(googleUser => {
            setClicked(true);
            var name = googleUser.getBasicProfile().getName();
            var email = googleUser.getBasicProfile().getEmail();
            var id = googleUser.getBasicProfile().getId();
            var token = googleUser.getAuthResponse().id_token;
            postLogin({ token, name, email, id });
          })
          .catch(error => {
            onError(error);
          });
      }
    }
  };
  return { onLogin: clickHandler, clicked, disabled, buttonRef };
}
