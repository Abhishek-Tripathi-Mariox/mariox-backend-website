module.exports = (lang = "en") => {
  const user_already_found = {
    en: "User already found with given username, Try again after new username!",
  };

  const success = {
    en: "success",
  };

  const logout = {
    en: "logout successfully",
  };

  const invalid_token = {
    en: "invalid token",
  };

  const users_list = {
    en: "users list",
  };

  const user_not_found = {
    en: "user detail not found with given id",
  };

  const user_not_found_email = {
    en: "email detail not found, please try after register",
  };

  const group_not_found = {
    en: "group detail not found with given id",
  };

  const forbidden = {
    en: "forbidden",
  };

  const user_exist_in_group = {
    en: "member already exists in this group",
  };

  const status_changed = {
    en: "Status changed successfully",
  };

  const incorrect_password = {
    en: "Entered password is incorrect!",
  };

  const otp_sent_on_mail = {
    en: "OTP sent on given email",
  };

  const social_id_missing = {
    en: "Social Id is missing",
  };

  return {
    user_already_found: user_already_found[lang],
    success: success[lang],
    logout: logout[lang],
    invalid_token: invalid_token[lang],
    users_list: users_list[lang],
    user_not_found: user_not_found[lang],
    group_not_found: group_not_found[lang],
    forbidden: forbidden[lang],
    user_exist_in_group: user_exist_in_group[lang],
    status_changed: status_changed[lang],
    incorrect_password: incorrect_password[lang],
    user_not_found_email: user_not_found_email[lang],
    otp_sent_on_mail: otp_sent_on_mail[lang],
    social_id_missing: social_id_missing[lang],
  };
};
