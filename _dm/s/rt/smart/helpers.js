function getCookie(name) {
    let cookieArr = document.cookie.split(';');

    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split('=');

        if (name === cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

function hasCookieOfType(actionType) {
    let cookieArr = document.cookie.split(';');

    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split('=');

        if (cookiePair[0].trim().includes(actionType)) {
            return true;
        }
    }
    return false;
}

function getSmartRuleCookieName(ruleObjName, actionType) {
    const conditionCheckedInClientEnabled =
        rtCommonProps[
            'platform.monolith.personalization.dateTimeCondition.popupMsgAction.moveToclient.enabled'
        ];
    return conditionCheckedInClientEnabled
        ? '_dm_showed_' +
              actionType +
              '_' +
              encodeURIComponent(ruleObjName, 'UTF-8')
        : '_dm_showed_' + encodeURIComponent(ruleObjName, 'UTF-8');
}

//after the action happens the first time we set cookie of shown with ttl
function setSmartRuleCookie(ruleObjName, actionType) {
    setCookie(
        getSmartRuleCookieName(ruleObjName, actionType),
        true,
        rtCommonProps['popup.insite.cookie.ttl']
    );
}

function setCookie(name, value, hours) {
    let expires = '';

    if (hours) {
        let date = new Date();
        date.setTime(date.getTime() + hours * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
    }

    document.cookie =
        name + '=' + encodeURIComponent(value) + expires + '; path=/';
}

//have to be var to be in global scope and accessible from other files
var ActionType = {
    POPUP: 'popup',
    MESSAGE: 'message',
};

const checkRuleLogicOnFeEnabled =
    rtCommonProps[
        'platform.monolith.personalization.dateTimeCondition.popupMsgAction.moveToclient.enabled'
    ];

const shouldCheckMultipleConditions =
    rtFlags[
        'streamline.monolith.personalization.supportMultipleConditions.enabled'
    ];

var ConditionType = {
    USER_VISITS: 'user_visits',
    ...(checkRuleLogicOnFeEnabled && {
        USER_IN_DATE_TIME_RANGE: 'user_in_date_time_range',
    }),
};

function checkIfInPreviewMode() {
    try {
        return window.parent.location.hash.indexOf('rule_preview') !== -1;
    } catch {
        return false;
    }
}

function shouldShowActionRule(settings) {
    const isInPreviewMode = checkIfInPreviewMode();
    if (isInPreviewMode) {
        return {}; // no need to check conditions in preview mode
    }

    if (shouldCheckMultipleConditions) {
        const ruleConditions = JSON.parse(settings.ruleConditions);
        const allConditionsMoveToFE = ruleConditions.every((condition) =>
            Object.values(ConditionType).includes(
                condition.conditionType.toLowerCase()
            )
        );
        if (!allConditionsMoveToFE) {
            return {};
        }
        const conditionTypeToCallback = {
            [ConditionType.USER_VISITS]: shouldShowRuleObjectForUserVisit,
            ...(checkRuleLogicOnFeEnabled && {
                [ConditionType.USER_IN_DATE_TIME_RANGE]:
                    shouldShowRuleObjectForDateTimeRange,
            }),
        };
        const conditionsToCheck = ruleConditions.map((condition) => {
            return {
                condition,
                callback:
                    conditionTypeToCallback[
                        condition.conditionType.toLowerCase()
                    ],
            };
        });
        return conditionsToCheck && conditionsToCheck.length
            ? { conditionsToCheck }
            : {};
    }
    const hasMoreThenOneCondition = settings.conditions_number > 1;
    const shouldCheckUserVisitsCondition =
        !hasMoreThenOneCondition && settings.user_visits_number !== undefined;
    const shouldCheckDateTimeRangeCondition =
        checkRuleLogicOnFeEnabled &&
        !hasMoreThenOneCondition &&
        settings.start_time &&
        settings.end_time;

    return {
        shouldCheckUserVisitsCondition,
        shouldCheckDateTimeRangeCondition,
    };
}

function parseBoolean(str) {
    return str.toLowerCase() === 'true';
}
