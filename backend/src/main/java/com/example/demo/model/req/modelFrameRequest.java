package com.example.demo.model.req;

import lombok.Data;
import net.sf.oval.constraint.Min;

@Data
public class modelFrameRequest {
    @Min(value = 0, message = "folder id can not be negative")
    private int folder_id;
}
