package com.ecc.common.exception;

public class BadRequestException extends BaseException {
    public BadRequestException(String message) {
        super(400, message);
    }
}