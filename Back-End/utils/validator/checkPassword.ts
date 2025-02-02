const checkPassword = (password : string) : boolean => {
    const validLength: boolean = password.length >= 8 && password.length <= 64;
    const rules: RegExp[] = [/[a-z]/g,/[A-Z]/g,/[0-9]/g,/[$@$!%*#.?&_-]/g];
    let stepsValidation: number = 0;
    rules.forEach((ele : RegExp) : void => {
      if (ele.test(password))
        stepsValidation++;
    });
    // stepsValidation == rules.length if the password match all regular expressions
    return validLength && stepsValidation == rules.length;
}

export default checkPassword;