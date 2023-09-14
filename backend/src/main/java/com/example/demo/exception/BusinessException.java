package com.example.demo.exception;

import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class BusinessException extends RuntimeException {
    private Integer code;
    private String msg;

    public BusinessException(int exceptionCode, String msg) {
        super(msg);
        this.code = exceptionCode;
        this.msg = msg;
    }
}
