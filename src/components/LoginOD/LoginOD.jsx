import React, { useEffect, useState, useCallback } from "react";
import "./LoginOD.scss";
import { connect } from "react-redux";
import config from "./../../../../../config";
import { phoneCodeToShow } from "./../../../../../helpers/countryConfig";
import { langCodeAllowed } from "./../../../../../locales";
import { pushDataLayerEvent } from "./../../../../../utils/DataLayer";
import {
  emailCriteriaFulfilled,
  onlyNumbersEntered,
} from "./../../../../../utils/helper";
import usePrevious from "./../../../../hooks/usePrevious";
import AuthModalImageOD from "./../AuthModalImageOD/AuthModalImageOD";
import FadeOD from "../FadeOD/FadeOD";
import UserInputErrorOD from "../UserInputErrorOD/UserInputErrorOD";
import ForgotPasswordOD from "../ForgotPasswordOD/ForgotPasswordOD";
import CountryCodeInputOD from "../CountryCodeInputOD/CountryCodeInputOD";
import { setCurrentWhatsappStatus } from "./../../../../../actionCreators/gupshupWhatsapp";
import ButtonOwnDays from "../../../../../CommonComponents/buttons/ButtonOwnDays/ButtonOwnDays";

const LoginOD = (props) => {
  const {
    allowSignUp,
    redisCommonData,
    localeInfo,
    registerActions,
    isCaptchaRequired,
    dataLocale,
    otpType,
    animation,
    userInputValidate,
    userInputErr,
    oTPLoginSuccess,
    user,
    commonActions,
    hideLogin,
    loginFromCL,
    setCurrentWhatsappStatus,
    isDesktopPdp,
    showSignUp,
    hasPlacedOrder,
    oTPSent,
    loginError,
    showPassCallback,
    setShowForgotPassSuccessAlert,
    hideImage,
    loading,
  } = props;

  let prevIsCaptchaRequired = usePrevious(isCaptchaRequired);
  const prevOTPSent = usePrevious(oTPSent);
  const prevUser = usePrevious(user);
  const prevoTPLoginSuccess = usePrevious(oTPLoginSuccess);
  const prevUserInputValidate = usePrevious(userInputValidate);

  const [userInputValue, setUserInputValue] = useState("");
  const [userInputOtp, setUserInputOtp] = useState("");
  const [userInputPassword, setUserInputPassword] = useState("");
  const [userInputError, setUserInputError] = useState(null);
  const [showEditText, setShowEditText] = useState(false);
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [whatsappOptin, setWhatsappOptin] = useState({});
  const [isUserOptInForWhatsapp, setIsUserOptInForWhatsapp] = useState({});
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [captchaResponse, setCaptchaResponse] = useState(null);
  const [currentPhoneCodeSelected, setCurrentPhoneCodeSelected] =
    useState(null);
  const [showCountryCode, setShowCountryCode] = useState(false);

  // add on states
  const [errorUsername, setErrorUsername] = useState(null);
  const [otpResent, setOtpResent] = useState("");
  const [errorPassword, setErrorPassword] = useState(null);
  const [emailValid, setEmailValid] = useState(false);
  const [phoneValid, setPhoneValid] = useState(false);
  const [triggerOfferGa, setTriggerOfferGa] = useState(true);
  const [toggleBlock, setToggleBlock] = useState(false);

  // State for show userName
  // const [userName, setUserName] = useState('');

  const [inputOtpError, setInputOtpError] = useState(null);

  const [disableTimer, setDisableTimer] = useState(false);

  // State for show Captch
  // const [captchaRendered, setCaptchaRendered] = useState(false);

  // otp state
  const [otpState, setOtpState] = useState({
    otpDigits: 4,
    otpValue: ["", "", "", ""],
  });
  let which;

  const [backBtnClick, setBackBtnClick] = useState(false); // using for animation back from otp screen

  const [showCustomError, setShowCustomError] = useState(false); // using this for fading away acount doesn't exist error message

  const [showUserPassword, setShowUserPassword] = useState(false); // show/hide password on eye click

  // !imp.
  useEffect(() => {
    if (isCaptchaRequired) {
      prevIsCaptchaRequired = true;
    }
  }, []);

  const {
    SIGN_IN,
    // THIS_IS_REQUIRED_FIELD,
    ENTER_ONE_TIME_PASSWORD_SENT_TO,
    OTP,
    RESEND,
    ENTER_PASSWORD_FOR,
    EDIT,
    FORGOT_PASSWORD,
    EXISTING_OWNDATS_CUSTOMER_QUESTION,
    LOGIN,
    LOADING,
  } = dataLocale;
  const { timerForWalletResendOTP, AVAILABLE_NEIGHBOUR_COUNTRIES } =
    redisCommonData;
  const countryConfig = AVAILABLE_NEIGHBOUR_COUNTRIES
    ? phoneCodeToShow(JSON.parse(AVAILABLE_NEIGHBOUR_COUNTRIES))
    : {};

  useEffect(() => {
    if ((userInputValidate || userInputErr) && errorUsername) {
      setShowCustomError(true);
    }
  }, [userInputValidate, userInputErr, errorUsername]);

  // useEffect(() => {
  // if (username !== userName) {
  // setUserName(username);
  // setUserInputValue(username);
  // if (onlyNumbersEntered(username) && userInputValue !== '') {
  //   setShowCountryCode(true);
  // }
  // }

  // return () => {
  //   setCaptchaRendered(false);
  // };
  // }, []);

  useEffect(() => {
    if (otpState && otpState.otpValue && otpState.otpValue.length > 0) {
      if (otpState.otpValue.join("").length < 4) {
        return;
      }
      setUserInputOtp(otpState.otpValue.join(""));
    }
  }, [otpState]);

  const resetOtpState = () => {
    setOtpState({ ...otpState, otpValue: ["", "", "", ""] });
  };

  //* state setup on mount

  useEffect(() => {
    let WHATSAPP_OPTIN =
      redisCommonData && redisCommonData?.WHATSAPP_OPTIN
        ? JSON.parse(redisCommonData?.WHATSAPP_OPTIN)
        : {};
    WHATSAPP_OPTIN =
      (WHATSAPP_OPTIN.Desktop && WHATSAPP_OPTIN.Desktop.Login) || {};
    setWhatsappOptin(WHATSAPP_OPTIN);
    setIsUserOptInForWhatsapp(WHATSAPP_OPTIN.toggle === "ON");

    if (localeInfo) {
      const { phoneCode } = langCodeAllowed[localeInfo.countryCode];
      setCurrentPhoneCodeSelected(phoneCode);
    }
  }, [localeInfo, redisCommonData]);

  const verifyCaptchaCallback = (response) => {
    if (response.length !== 0) {
      setIsCaptchaVerified(true);
      setCaptchaResponse(response);
    }
  };

  const resetCaptcha = () => {
    window.grecaptcha.reset();
    setIsCaptchaVerified(false);
    setCaptchaResponse(null);
  };

  const resetTimeOUt = () => {
    clearInterval(window.secondsTimer);
  };

  const setTimeout = useCallback(() => {
    const otpInput = document.querySelector(".otpPasswordField");
    if (otpInput) {
      otpInput.focus();
    }
    let timer = redisCommonData.timerForWalletResendOTP / 1000;
    window.secondsTimer = setInterval(() => {
      if (timer > 0) {
        timer -= 1;
        if (timer < 10) {
          timer = `0${timer}`;
        }
      }
      if (timer === 0) {
        setShowEditText(true);
        resetTimeOUt();
      }
      if (document.getElementById("otpTimer") && !isNaN(timer)) {
        document.getElementById("otpTimer").innerHTML = `00:${timer}`;
      }
      if (timer === 0 || timer == "00") {
        setDisableTimer(true);
      } else {
        setDisableTimer(false);
      }
    }, 1000);
  }, [redisCommonData.timerForWalletResendOTP]);

  const fnSendValidateOtp = useCallback(
    (data, type, occurence) => {
      if (userInputValue === "") return;
      if (window.dtm.LenskartRewamp) {
        if (occurence === "Resend") {
          window.dtm.LenskartRewamp.loginPopup.load.loginPopupResendOtp(
            data.data.username
          );
        } else if (type !== "VALIDATE_OTP") {
          window.dtm.LenskartRewamp.loginPopup.load.loginPopupEnterOtp(
            data.data.username
          );
        }
      }
      data.type = type;
      data.phoneCode = currentPhoneCodeSelected;
      data.captchaKey = captchaResponse;
      data.occurence = occurence;
      if (data && data?.data) {
        data.data.username = userInputValue;
      }
      registerActions.sendValidateOtp(data);
    },
    [captchaResponse, currentPhoneCodeSelected, registerActions, userInputValue]
  );

  const renderCaptcha = useCallback(() => {
    window.grecaptcha.render(
      "recaptcha",
      {
        sitekey: config.siteKey,
        theme: "light",
        callback: verifyCaptchaCallback,
        "expired-callback": resetCaptcha,
      },
      []
    );
    setIsCaptchaVerified(false);
  }, []);

  // * mount changes
  useEffect(() => {
    registerActions.resetAuthData();
    if (isCaptchaRequired) {
      renderCaptcha();
    }
  }, [isCaptchaRequired, registerActions, renderCaptcha]);

  // * update changes ...
  useEffect(() => {
    // If => user entered mobile/email is not there in mobile login db
    // else if => user enterd mobile is there in mobile login db then send OTP to user mobile
    // else if => user entered email is there in mobile login db the show password field for user

    if (
      userInputValidate &&
      userInputValidate !== null &&
      userInputValidate.result.accounts.length > 0 &&
      userInputValidate.result.data.validBlock === "email" &&
      userInputValue !== ""
    ) {
      setEmailValid(true);
      setToggleBlock(true);
      setErrorUsername(null);
      setPhoneValid(false);
    }

    if (
      prevUserInputValidate !== userInputValidate &&
      userInputValidate &&
      userInputValidate?.result?.accounts?.length === 0 &&
      window.dtm.LenskartRewamp
    ) {
      window.dtm.LenskartRewamp.loginPopup.load.loginPopupAccountNotFound();
    } else if (
      prevUserInputValidate !== userInputValidate &&
      userInputValidate &&
      userInputValidate.result.accounts.length > 0 &&
      userInputValidate.result.data.validBlock === "mobile"
    ) {
      fnSendValidateOtp(userInputValidate?.result, "SEND_OTP");
    }

    if (userInputValidate && userInputValidate.result.accounts.length === 0) {
      setErrorUsername("Account Does not exists..");
    }
  }, [
    fnSendValidateOtp,
    prevUserInputValidate,
    userInputValidate,
    userInputValue,
  ]);

  useEffect(() => {
    if (prevOTPSent !== oTPSent && oTPSent === true) {
      setTimeout();
    }

    // otp doesn't match
    if (typeof oTPSent !== "boolean" && oTPSent.error) {
      setOtpResent("");
    }
  }, [oTPSent, prevOTPSent, setTimeout]);

  useEffect(() => {
    if (
      userInputErr !== null &&
      userInputErr.message &&
      userInputValidate === null
    ) {
      setErrorUsername(userInputErr.message);
      setOtpResent("");
    }
  }, [userInputErr, userInputValidate]);

  useEffect(() => {
    if (loginError && userInputValue) {
      // setting error message if user has typed in something
      // redux state for emailError isn't changing on unmount
      setErrorPassword(loginError.message);
      setOtpResent("");
      if (!loginFromCL)
        _gaq.push([
          "_trackEvent",
          "SIGNUP POPUP",
          "Login Failure",
          `page: ${document.location.pathname}${document.location.search}`,
        ]);
      _gaq.push([
        "ninja._trackEvent",
        "SIGNUP POPUP",
        "Login Failure",
        `page: ${document.location.pathname}${document.location.search}`,
      ]);
    }
  }, [loginError, loginFromCL, userInputValue]);

  useEffect(() => {
    if (
      (!prevUser && user) ||
      (prevoTPLoginSuccess !== oTPLoginSuccess && oTPLoginSuccess === true)
    ) {
      if (window.dtm.LenskartRewamp)
        window?.dtm?.LenskartRewamp?.loginSuccess?.success();
      if (
        userInputValidate &&
        userInputValidate.result &&
        userInputValidate.result.data &&
        userInputValidate.result.data.validBlock === "mobile"
      ) {
        setCurrentWhatsappStatus(isUserOptInForWhatsapp);
      }
      // Offer Modal : User has placed the order, Authmodal should hide
      if ((hideLogin && !isDesktopPdp) || hasPlacedOrder) hideLogin();
      // Offer Modal : User didn't placed order, Show signup tab to get campaign data
      if (isDesktopPdp && !hasPlacedOrder) {
        showSignUp();
      }
      commonActions.getUserInfo();
      commonActions.shortlist("", "get", "?attributes=true");
      if (!loginFromCL)
        _gaq.push([
          "_trackEvent",
          "SIGNUP POPUP",
          "Login Success",
          `page: ${document.location.pathname}${document.location.search}`,
        ]);
      _gaq.push([
        "ninja._trackEvent",
        "SIGNUP POPUP",
        "Login Success",
        `page: ${document.location.pathname}${document.location.search}`,
      ]);
      if (window.prevUrl) window.history.back();
    }
  }, [
    commonActions,
    hasPlacedOrder,
    hideLogin,
    isDesktopPdp,
    isUserOptInForWhatsapp,
    loginFromCL,
    oTPLoginSuccess,
    prevUser,
    prevoTPLoginSuccess,
    setCurrentWhatsappStatus,
    showSignUp,
    user,
    userInputValidate,
  ]);

  const setCaptcha = (response) => {
    setCaptchaResponse(response);
  };
  useEffect(() => {
    // Conditions for Captcha
    // if (prevIsCaptchaRequired !== isCaptchaRequired && isCaptchaRequired) {
    //   setCaptcha(null);
    // }
    // if (isCaptchaRequired && isCaptchaVerified && oTPSent) {
    //   resetCaptcha();
    // } else if (prevIsCaptchaRequired !== isCaptchaRequired && isCaptchaRequired) {
    //   renderCaptcha();
    // }

    if (
      prevIsCaptchaRequired !== undefined &&
      prevIsCaptchaRequired !== isCaptchaRequired &&
      isCaptchaRequired
    ) {
      renderCaptcha();
    } else if (
      prevIsCaptchaRequired === isCaptchaRequired &&
      isCaptchaRequired &&
      isCaptchaVerified &&
      prevOTPSent !== oTPSent
    ) {
      resetCaptcha();
    } else if (
      prevIsCaptchaRequired !== isCaptchaRequired &&
      !isCaptchaRequired
    ) {
      setCaptcha(null);
    }
  }, [
    isCaptchaRequired,
    isCaptchaVerified,
    oTPSent,
    prevIsCaptchaRequired,
    prevOTPSent,
    renderCaptcha,
  ]);

  useEffect(() => {
    const offerFlow = sessionStorage.getItem("offerSelected");
    if (phoneValid && offerFlow && triggerOfferGa) {
      const offerGtm = {
        event: "lead form",
        pageName: "otp lead",
        pageType: "lead form",
        category: "",
        channel: "",
        subSection1: "",
        PageUrl: window?.location.href || "",
        LkUserType: "lkNew",
        loginStatus: "guest",
      };
      pushDataLayerEvent(offerGtm);
      setTriggerOfferGa(false);
    }
  }, [phoneValid, triggerOfferGa]);

  useEffect(() => {
    if (oTPSent && oTPSent === true && userInputValue !== "") {
      setErrorUsername(null);
      setEmailValid(false);
      setPhoneValid(true);
      setToggleBlock(true);
    }
  }, [oTPSent, userInputValue]);

  const makeLoginApiCall = useCallback(
    (data, errorPassword, errorEmail, validBlock) => {
      if (
        (validBlock === "emailValid" && !errorEmail) ||
        (validBlock === "phoneValid" && !errorEmail)
      ) {
        registerActions.authenticateUser(data);
      }
    },
    [registerActions]
  );

  const doLogin = useCallback(
    (data, validBlock) => {
      const { errorEmail } = props;
      if (validBlock === "emailValid") {
        setErrorPassword(null);
        resetTimeOUt();
        makeLoginApiCall(data, errorPassword, errorEmail, validBlock);
      }
    },
    [errorPassword, makeLoginApiCall, props]
  );

  // Check if field required
  // const required = value => (value ? undefined : THIS_IS_REQUIRED_FIELD);

  const isMobileEmail = useCallback(
    (value) => {
      const { regex, maxMobileNumberLength, minMobileNumberLength } =
        langCodeAllowed[localeInfo.countryCode];
      let error = null;

      if (
        (!regex.test(value) ||
          (value &&
            (value.length > maxMobileNumberLength ||
              value.length < minMobileNumberLength))) &&
        !emailCriteriaFulfilled(value)
      ) {
        error = dataLocale.PLEASE_ENTER_VALID_EMAIL_MOBILE;
      }
      if (
        value &&
        (emailCriteriaFulfilled(value) ||
          !onlyNumbersEntered(value) ||
          value.length > maxMobileNumberLength)
      ) {
        setShowCountryCode(false);
      } else if (!value) {
        setShowCountryCode(false);
      } else {
        setShowCountryCode(true);
      }
      // * removing required for now , as button is disabled.
      // if (!value || !value.trim()) {
      //   error = THIS_IS_REQUIRED_FIELD;
      // }
      return error;
    },
    [dataLocale.PLEASE_ENTER_VALID_EMAIL_MOBILE, localeInfo.countryCode]
  );

  const inputFieldHandler = (ev) => {
    const value = ev.target.value;
    const err = isMobileEmail(value);

    if (err) {
      setUserInputError(err);
    } else {
      setUserInputError(null);
    }
    setUserInputValue(value);
  };
  const handleSubmit = useCallback(
    (ev = null) => {
      if (ev) {
        ev.preventDefault();
      }
      setBackBtnClick(false);

      const { maxMobileNumberLength, minMobileNumberLength } =
        langCodeAllowed[localeInfo.countryCode];
      const data = {
        username: userInputValue,
      };

      if (!oTPSent) {
        setUserInputOtp("");
      }

      if (!userInputValidate) {
        setUserInputPassword("");
      }
      if (userInputPassword) data.password = userInputPassword;
      if (userInputOtp) data.code = userInputOtp;
      // Below code to check the valid block with regEx for email and mobile number

      if (isNaN(data.username) && !emailValid) {
        data.validBlock = "email";
        data.phoneCode = currentPhoneCodeSelected;
        registerActions.validateUserInput(data);
      } else if (
        !phoneValid &&
        data.username &&
        data.username.length <= maxMobileNumberLength &&
        data.username.length >= minMobileNumberLength
      ) {
        window.timeOutTimer = null;
        data.validBlock = "mobile";
        data.phoneCode = currentPhoneCodeSelected;
        registerActions.validateUserInput(data);
      }
      if (
        phoneValid &&
        userInputOtp !== "" &&
        userInputValidate &&
        (userInputValidate.result.type === "SEND_OTP" ||
          userInputValidate.result.type === "VALIDATE_OTP")
      ) {
        fnSendValidateOtp(data, "VALIDATE_OTP");
      }
      // Below code is to check if user has entered emailId then validate and let user login
      if (emailValid && userInputPassword !== "") {
        doLogin(data, "emailValid");
      }
      if (
        !phoneValid &&
        data.username &&
        (data.username.length > maxMobileNumberLength ||
          data.username.length < minMobileNumberLength)
      ) {
        isMobileEmail(data.username);
      }
    },
    [
      currentPhoneCodeSelected,
      doLogin,
      emailValid,
      fnSendValidateOtp,
      isMobileEmail,
      localeInfo.countryCode,
      oTPSent,
      phoneValid,
      registerActions,
      userInputOtp,
      userInputPassword,
      userInputValidate,
      userInputValue,
    ]
  );

  useEffect(() => {
    // submit when user enter all digits and captcha not required or verified if required
    if (userInputOtp !== "") {
      if (isCaptchaRequired && !isCaptchaVerified) return;
      handleSubmit();
    }
  }, [handleSubmit, isCaptchaRequired, isCaptchaVerified, userInputOtp]);

  // setting opt resent text to empty - after couple seconds
  useEffect(() => {
    if (otpResent !== "") {
      window.setTimeout(() => {
        setOtpResent("");
      }, 2000);
    }
  }, [otpResent]);

  const editValue = (type) => {
    resetTimeOUt();
    registerActions.resetMobileLoginProps();
    if (type !== "resend-otp") {
      setEmailValid(false);
      setPhoneValid(false);
      setToggleBlock(false);
      setShowEditText(false);
      setErrorPassword(null);
      setOtpResent("");
    }
    if (window.dtm.LenskartRewamp)
      window.dtm.LenskartRewamp.loginPopup.load.loginPopupEditEmailNumber(
        "email"
      );
  };

  const forgotPassword = () => {
    showPassCallback();
    setShowForgotPass(true);
    if (window.dtm.LenskartRewamp)
      window.dtm.LenskartRewamp.checkout.load.loginForgotPassword("account");
  };
  const onOtpChange = (ev) => {
    const next = ev.target.nextElementSibling;
    const previous = ev.target.previousElementSibling;
    const value = ev.target.value;
    const id = ev.target.id;
    const numbers = /^[0-9]+$/;
    if (numbers.test(value)) {
      if (which !== 8 && which >= 48 && which <= 57) {
        const arr = otpState.otpValue;
        arr[parseInt(id, 10)] = value;
        setOtpState({ ...otpState, arr });

        setOtpState({ ...otpState, otpValue: [].concat(otpState.otpValue) });
        setInputOtpError(null);
        if (next) {
          next.focus();
        }
      }
    } else if (which === 8) {
      const arr = otpState.otpValue;
      arr[parseInt(id, 10)] = "";
      setOtpState({ ...otpState, arr });

      setOtpState({ ...otpState, otpValue: [].concat(otpState.otpValue) });

      if (next || previous) {
        if (which === 8) {
          if (previous) previous.focus();
        } else if (next) {
          next.focus();
        }
      }
    } else if (which === undefined) {
      const arr = otpState.otpValue;
      if (arr[parseInt(id, 10)] === "") return;
      arr[parseInt(id, 10)] = "";
      setOtpState({ ...otpState, arr });

      setOtpState({ ...otpState, otpValue: [].concat(otpState.otpValue) });

      if (next || previous) {
        if (which === 8) {
          if (previous) previous.focus();
        } else if (next) {
          next.focus();
        }
      }
    }
  };

  const otpKeyDown = (ev) => {
    ev.persist();
    const id = ev.target.id;
    if (ev.which === 13) return;
    which = ev.which;
    if (which !== 8 && which >= 48 && which <= 57) {
      if (otpState.otpValue[parseInt(id, 10)]) {
        if (id < 4) {
          if (parseInt(id, 10) === 3) {
            const val = otpState.otpValue;
            val[parseInt(id, 10)] = String.fromCharCode(ev.keyCode);
            setOtpState({ ...otpState, val });
          } else {
            const val = otpState.otpValue;
            val[parseInt(id, 10) + 1] = String.fromCharCode(ev.keyCode);
            setOtpState({ ...otpState, val });
          }
          setInputOtpError(null);
        }
        const next = ev.target.nextElementSibling;
        const previous = ev.target.previousElementSibling;

        setOtpState({ ...otpState, otpValue: [].concat(otpState.otpValue) });

        if (next || previous) {
          if (ev.which === 8) {
            if (previous) window.setTimeout(() => previous.focus(), 10);
          } else if (next) window.setTimeout(() => next.focus(), 10);
        }
      }
    } else if (ev.which === 8) {
      const previous = ev.target.previousElementSibling;
      if (previous) window.setTimeout(() => previous.focus(), 10);
      setInputOtpError("Please enter only numeric digits");
    } else {
      setInputOtpError("Please enter only numeric digits");
    }
    // remove error if user starts typing again
    if (errorPassword) {
      setErrorPassword(null);
    }
  };

  const renderInput = () => {
    const inputBoxes = [];
    for (let index = 0; index < otpState.otpDigits; index += 1) {
      inputBoxes.push(
        <input
          key={index}
          autoComplete="off"
          autoFocus={index === 0}
          className="od-disc-input-field-item"
          id={index}
          maxLength="1"
          type="tel"
          value={otpState.otpValue[index]}
          onChange={(ev) => onOtpChange(ev)}
          onKeyDown={(ev) => otpKeyDown(ev)}
        />
      );
    }
    return inputBoxes;
  };

  // Return if needed userWhatsappOptinStatus
  // const getCheckBoxStatus = userWhatsappOptinStatus => {
  //   setIsUserOptInForWhatsapp(userWhatsappOptinStatus);
  // };

  const changePhoneCode = (code) => {
    setCurrentPhoneCodeSelected(code);
  };

  // return true if any digit in otp field isn't filled
  const isOtpEmpty = () => {
    return otpState.otpValue.some((element) => element === "");
  };

  useEffect(() => {
    if (userInputError !== null) {
      setErrorUsername(null);
    }
  }, [userInputError]);

  const handleKeyUpOnInput = (ev) => {
    ev.preventDefault();
    if (
      userInputError !== null ||
      userInputValue === "" ||
      (phoneValid && isOtpEmpty()) ||
      (emailValid && userInputPassword === "") ||
      (!isCaptchaVerified && isCaptchaRequired)
    )
      return;

    if (ev.keyCode === 13) {
      handleSubmit();
    }
  };

  return !showForgotPass ? (
    <div className={`${animation ? "od-animate-left-login-modal" : ""}`}>
      {!hideImage && <AuthModalImageOD redisCommonData={redisCommonData} />}
      <div className="od-auth-modal-login-container">
        <div>
          <div className={`od-modal-heading `}>
            {(phoneValid || emailValid) && (
              <div
                className="od-modal-heading-arrow animate-left-small"
                onClick={() => {
                  editValue("edit-email");
                  setBackBtnClick(true);
                  resetOtpState();
                }}
              >
                <img
                  alt="edit"
                  src="https://static1.lenskart.com/media/desktop/img/DesignStudioIcons/LeftArrowBlue.svg"
                />
              </div>
            )}
            <div className="od-modal-heading-title od-font-bold">{SIGN_IN}</div>
          </div>
          <div className="od-modal-heading-content">
            {!toggleBlock && (
              <div
                className={`od-modal-input-field-container ${
                  backBtnClick ? "od-animate-left-login-modal" : ""
                }`}
              >
                <div className="od-animate-left-login-modal od-font-reg">
                  {countryConfig &&
                  countryConfig.availableCountries.length > 0 ? (
                    <CountryCodeInputOD
                      changeHandler={changePhoneCode}
                      customStyle={{
                        display: showCountryCode ? "block" : "none",
                      }}
                      list={countryConfig.availableCountries}
                    />
                  ) : (
                    showCountryCode && (
                      <span className="od-country-code-fixed">
                        {currentPhoneCodeSelected}{" "}
                      </span>
                    )
                  )}
                </div>
                <input
                  autoComplete="emailOrPhone"
                  className={`od-modal-input-field od-font-reg ${
                    showCountryCode ? "animate-left-small" : ""
                  }`}
                  name="emailOrPhone"
                  placeholder="Mobile/Email"
                  value={userInputValue}
                  onChange={inputFieldHandler}
                  onKeyUp={(ev) => handleKeyUpOnInput(ev)}
                />
              </div>
            )}
          </div>

          {/* // error text  */}
          {!oTPSent.error && userInputError !== null && (
            <FadeOD show={userInputError}>
              <UserInputErrorOD message={userInputError} />
            </FadeOD>
          )}

          {/* // error if account doesn't exist */}
          {userInputValue !== "" &&
            (userInputValidate || userInputErr) &&
            errorUsername &&
            showCustomError && (
              <FadeOD show={showCustomError}>
                <UserInputErrorOD message={errorUsername} />
              </FadeOD>
            )}

          {phoneValid && (
            <div className="od-signIn-otp-container od-animate-right-login-modal">
              <div>
                <div className="od-signIn-otp-heading">
                  {ENTER_ONE_TIME_PASSWORD_SENT_TO}
                </div>
                <div className="od-signIn-otp-content">
                  <div className="od-signIn-otp-text od-font-reg">
                    {currentPhoneCodeSelected} {userInputValue}{" "}
                  </div>
                  <div
                    className="od-signIn-otp-edit-text od-font-bold"
                    onClick={() => {
                      setBackBtnClick(true);
                      editValue("edit-phone");
                      resetOtpState();
                      if (window.dtm.LenskartRewamp)
                        window.dtm.LenskartRewamp.loginPopup.load.loginPopupEditEmailNumber(
                          "phone"
                        );
                    }}
                  >
                    {EDIT}
                  </div>
                </div>
              </div>
              <div className="od-signIn-otp-main">
                <div className="od-disc-input-field-container">
                  {renderInput()}
                </div>
                <div
                  className={`od-opt-input-resendTimer ${
                    !isCaptchaVerified && isCaptchaRequired
                      ? "resend-disable"
                      : ""
                  }`}
                >
                  <span
                    className={`od-otp-resend-text ${
                      (!isCaptchaVerified && isCaptchaRequired) || !disableTimer
                        ? "disable-text-new"
                        : ""
                    }`}
                    onClick={() => {
                      fnSendValidateOtp(
                        userInputValidate?.result,
                        "SEND_OTP",
                        "Resend"
                      );
                      setErrorPassword(null);
                      setOtpResent("A new otp sent");
                      setShowEditText(false);
                    }}
                  >
                    {RESEND} {OTP}{" "}
                  </span>
                  <span
                    className="od-otp-resend-text-secondary od-animate-left-login-modal"
                    style={
                      disableTimer ? { display: "none" } : { display: "block" }
                    }
                  >
                    in
                  </span>
                  <span
                    className="od-otpTimer od-animate-left-login-modal"
                    id="otpTimer"
                    style={
                      disableTimer ? { display: "none" } : { display: "block" }
                    }
                  >
                    {timerForWalletResendOTP / 1000 >= 10
                      ? `00:${timerForWalletResendOTP / 1000}`
                      : `00:0${timerForWalletResendOTP / 1000}`}
                  </span>
                </div>
              </div>

              {otpResent !== "" && (
                <FadeOD show={otpResent}>
                  <div className="od-otp-resend-text-alert">{otpResent}</div>
                </FadeOD>
              )}
            </div>
          )}
          {/* // error if user enter wrong otp or otp failed to send  */}
          {(errorPassword || oTPSent?.error?.message) &&
            (otpType === "SEND_OTP" || otpType === "VALIDATE_OTP") && (
              <div className="od-sign-in-error-msg od-font-reg">
                {oTPSent?.error?.message}
              </div>
            )}
          {inputOtpError && !oTPSent?.error && !oTPSent?.error?.message && (
            <div className="od-sign-in-error-msg od-fonr-reg">
              {inputOtpError}
            </div>
          )}

          {/* // if user enters email ...  */}
          {emailValid && (
            <div className="od-signIn-otp-container od-animate-right-login-modal">
              <div>
                <div className="od-signIn-otp-heading">
                  {ENTER_PASSWORD_FOR}
                </div>

                <div className="od-signIn-otp-content">
                  <div className="od-signIn-otp-text od-font-reg">
                    {userInputValue}
                  </div>

                  <div
                    className="od-signIn-otp-edit-text od-font-bold"
                    onClick={() => {
                      setBackBtnClick(true);
                      editValue("edit-email");
                    }}
                  >
                    {EDIT}
                  </div>
                </div>
              </div>
              <div className="od-signIn-otp-main">
                <div className="od-login-password-input-field-container">
                  <input
                    autoComplete="password"
                    className="od-login-password-input-field od-font-reg"
                    placeholder="Enter password"
                    title="password"
                    type={showUserPassword ? "text" : "password"}
                    value={userInputPassword}
                    onChange={(e) => setUserInputPassword(e.target.value)}
                    onFocus={() => {
                      setErrorPassword(null);
                    }}
                    onKeyUp={(ev) => handleKeyUpOnInput(ev)}
                  />
                  {userInputPassword !== "" && (
                    <span
                      className={`od-login-password-field-img ${
                        showUserPassword ? "od-strike-through" : ""
                      }`}
                      onClick={() => setShowUserPassword((prev) => !prev)}
                    >
                      <img
                        alt="show/hide"
                        src="https://static1.lenskart.com/media/desktop/img/DesignStudioIcons/Eye.svg"
                      />
                    </span>
                  )}
                </div>

                {!loginFromCL && (
                  <div className="od-otp-input-resendTimer od-font-bold">
                    <span
                      className="od-forget-password-text"
                      onClick={forgotPassword}
                    >
                      {FORGOT_PASSWORD}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* // any error - otp || password */}
          {(phoneValid || emailValid) &&
            (!errorPassword || !oTPSent) &&
            !errorUsername &&
            errorPassword && (
              <div className="od-sign-in-error-msg od-font-reg">
                {errorPassword}
              </div>
            )}

          {isCaptchaRequired && <div id="recaptcha"></div>}
          {isCaptchaRequired && oTPSent && (
            <ButtonOwnDays
              disabled={!isCaptchaVerified && isCaptchaRequired}
              fontClass="od-font-bold"
              mode="grey"
              style={{ margin: "20px 0 20px 0" }}
              text="Verify"
              width="100%"
              onClick={() => {
                fnSendValidateOtp(
                  userInputValidate?.result,
                  "SEND_OTP",
                  "Resend"
                );
                setErrorPassword(null);
                setOtpResent("A new otp has been sent.");
                setShowEditText(false);
              }}
            />
          )}
        </div>
        <div>
          <ButtonOwnDays
            disabled={
              userInputError !== null ||
              userInputValue === "" ||
              (phoneValid && isOtpEmpty()) ||
              (emailValid && userInputPassword === "") ||
              (!isCaptchaVerified && isCaptchaRequired)
            }
            fontClass="od-font-bold"
            mode="grey"
            width="100%"
            onClick={handleSubmit}
          >
            {!loading ? (
              <span>{!phoneValid || !emailValid ? SIGN_IN : "Proceed"}</span>
            ) : (
              <span>{LOADING}...</span>
            )}
          </ButtonOwnDays>

          {allowSignUp ? (
            <ButtonOwnDays
              fontClass="od-font-reg"
              fontSize="16px"
              mode="white-4"
              px="20px"
              py="12px"
              style={{ boxShadow: "none", marginTop: "24px" }}
              width="100%"
              onClick={() => showSignUp(true)}
            >
              <div className="od-login-modal-register-button">
                <div className="od-register-text-primary od-font-reg">
                  {EXISTING_OWNDATS_CUSTOMER_QUESTION}
                </div>
                <div className="od-register-text-secondary od-font-bold">
                  {LOGIN}
                </div>
              </div>
            </ButtonOwnDays>
          ) : null}
        </div>
      </div>
    </div>
  ) : (
    <>
      <ForgotPasswordOD
        {...props}
        hideLogin={hideLogin}
        registerActions={registerActions}
        setShowForgotPassSuccessAlert={setShowForgotPassSuccessAlert}
        showLoginCallback={() => {
          setShowForgotPass(false);
          clearTimeout(window.timeOutTimer);
        }}
      />
    </>
  );
};
const mapStateToProps = (state) => ({
  localeInfo: state.common.localeInfo,
  isCaptchaRequired: state.auth.isCaptchaRequired,
  otpType: state.auth.otpType,
  loading: state.auth.loading,
});

const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentWhatsappStatus: (status) =>
      dispatch(setCurrentWhatsappStatus(status)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginOD);
