package com.example.demo.model.req;

import lombok.Data;
import net.sf.oval.constraint.Min;

@Data
public class modelJointsRequest {
    @Min(value = 0, message = "frame number can not be negative")
    private int n_frame;
    @Min(value = 0, message = "folder id can not be negative")
    private int folder_id;
}
