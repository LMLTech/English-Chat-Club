package com.ecc.common.exception;

public class ResourceNotFoundException extends BaseException {
    public ResourceNotFoundException(String message) {
        super(404, message);
    }
}