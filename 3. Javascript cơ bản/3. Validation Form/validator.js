const Validator = (options) => {
    const getParent = (element, selector) => {
        while (element.parent()) {
            if (element.parent().get(0).matches(selector)) {
                return element.parent();
            }
            element = element.parent();
        }
    };

    var selectorRules = {};
    // Hàm thực hiện validate
    const validate = (inputElement, rule) => {
        var errorMessage,
            errorElement = getParent(inputElement, options.formGroupSelector).find(options.errorSelector);

        // Lấy ra các rule của selector
        var rules = selectorRules[rule.selector];
        // Lập qua từng rule và kiểm tra (nếu có lỗi thì dừng việc kiểm tra)
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.attr("type")) {
                case "radio":
                case "checkbox":
                    errorMessage = rules[i](formElement.find(rule.selector + ":checked").length);
                    break;
                default:
                    errorMessage = rules[i]($(inputElement).val());
                    break;
            }
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.text(errorMessage);
            getParent(inputElement, options.formGroupSelector).addClass("invalid");
        } else {
            errorElement.text("");
            getParent(inputElement, options.formGroupSelector).removeClass("invalid");
        }

        return !errorMessage;
    };

    // Lấy element của form cần validate
    var formElement = $(options.form);
    if (formElement) {
        // Khi submit form
        var isFormValid = true;
        $(formElement).on("submit", function (event) {
            event.preventDefault();
            options.rules.forEach((rule) => {
                var inputElement = formElement.find(rule.selector),
                    isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });
            if (isFormValid) {
                // Trường hợp submit với Javacript
                if (typeof options.onSubmit === "function") {
                    var enableInputs = formElement.find("[name]:not([disable])");
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        switch (input.type) {
                            case "radio":
                                if (input.matches(":checked")) {
                                    values[input.name] = input.value;
                                }
                                break;
                            case "checkbox":
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                if (input.matches(":checked")) {
                                    values[input.name].push(input.value);
                                }
                                break;
                            case "file":
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                                break;
                        }
                        return values;
                    }, {});
                    options.onSubmit(formValues);
                }
                // Trường hợp submit với hành vi mặc định
                else {
                    formElement.submit();
                }
            }
        });
        // Lập qua mỗi rule và lắng nghe sự kiện (blur, input, ....)
        options.rules.forEach((rule) => {
            // Lưu lại các rule cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }
            var inputElement = formElement.find(rule.selector);
            if (inputElement) {
                // Xử lý trường hợp blur khỏi input
                $(inputElement).blur(() => {
                    validate(inputElement, rule);
                });
                // Xử lý trường hợp người dùng nhập vào input
                $(inputElement).on("input", () => {
                    var errorElement = getParent(inputElement, options.formGroupSelector).find(options.errorSelector);
                    errorElement.text("");
                    getParent(inputElement, options.formGroupSelector).removeClass("invalid");
                });
            }
        });
    }
};

Validator.isRequired = (selector, message) => {
    return {
        selector: selector,
        test: (value) => {
            return value ? undefined : message || "Vui lòng nhập trường này!";
        },
    };
};

Validator.isEmail = (selector, message) => {
    return {
        selector: selector,
        test: (value) => {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || "Trường này phải là email!";
        },
    };
};

Validator.minLength = (selector, min, message) => {
    return {
        selector: selector,
        test: (value) => {
            return value.length >= min ? undefined : message || `Vui lòng nhập mật khẩu có ${min} kí tự!`;
        },
    };
};

Validator.isConfirmed = (selector, getConfirmValue, message) => {
    return {
        selector: selector,
        test: (value) => {
            return value === getConfirmValue() ? undefined : message || "Nhập giá trị không chính xác";
        },
    };
};
