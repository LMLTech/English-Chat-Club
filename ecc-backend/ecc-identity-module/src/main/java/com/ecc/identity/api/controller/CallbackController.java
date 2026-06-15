package com.ecc.identity.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CallbackController {

    @GetMapping("/callback")
    public String handleGoogleCallback(@RequestParam(name = "code") String code) {
        // Chỉ cần trả về chuỗi này, bạn copy cái chuỗi code này đi là xong!
        return "Mã authCode của bạn đây: " + code;
    }
}
