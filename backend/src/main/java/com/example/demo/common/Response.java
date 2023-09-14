package com.example.demo.common;

import com.example.demo.exception.BusinessException;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.util.StringUtils;


@Data
@NoArgsConstructor
public class Response<T> {
    private int code;
    private String message;
    private T data;
    public Response(T data) {
        this.code = 0;
        this.message = "success";
        this.data = data;
    }

    public Response(int code, String message) {
        this.code = code;
        this.message = message;
        this.data = null;
    }

    /**
     * generate response based on a business exception
     * @param exception business exception
     * @return response
     */
    public static Response<String> exceptionResponse(BusinessException exception) {
        Response<String> response = new Response<>();
        String message = exception.getMsg();
        if (!StringUtils.isEmpty(message)) {
            response.setMessage(message);
        } else {
            response.setMessage(exception.toString());
        }
        response.setCode(exception.getCode());
        return response;
    }
}

