package com.weddinggallery.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name="devices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Device {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
    @Column(name="client_id", nullable=false, unique=true)
    private UUID clientId;
    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="user_id", nullable=false)
    private User user;
    private String name;
    private String deviceInfo;
    private LocalDateTime createdAt;
}