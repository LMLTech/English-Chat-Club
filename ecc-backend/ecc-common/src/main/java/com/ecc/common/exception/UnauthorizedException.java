package com.ecc.common.exception;

public class UnauthorizedException extends BaseException {
    public UnauthorizedException(String message) {
        super(401, message);
    }
}