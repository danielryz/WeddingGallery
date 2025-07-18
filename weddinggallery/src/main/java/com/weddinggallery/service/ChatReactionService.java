package com.weddinggallery.service;

import com.weddinggallery.dto.chat.ChatReactionResponse;
import com.weddinggallery.dto.chat.ChatReactionCountResponse;
import com.weddinggallery.model.ChatMessage;
import com.weddinggallery.model.ChatMessageReaction;
import com.weddinggallery.model.Device;
import com.weddinggallery.repository.ChatMessageReactionRepository;
import com.weddinggallery.repository.ChatMessageRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatReactionService {
    private final ChatMessageReactionRepository reactionRepository;
    private final ChatMessageRepository messageRepository;
    private final DeviceService deviceService;

    @Transactional
    public ChatReactionResponse addReaction(Long messageId, String emoji, HttpServletRequest request) {
        Device device = deviceService.getRequestingDevice(request);
        ChatMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new AccessDeniedException("Message not found"));
        var existing = reactionRepository.findByMessageIdAndDeviceId(messageId, device.getId());
        ChatMessageReaction reaction;
        if (existing.isPresent()) {
            reaction = existing.get();
            reaction.setEmoji(emoji);
            reaction.setCreatedAt(LocalDateTime.now());
        } else {
            reaction = ChatMessageReaction.builder()
                    .message(message)
                    .device(device)
                    .emoji(emoji)
                    .createdAt(LocalDateTime.now())
                    .build();
        }
        ChatMessageReaction saved = reactionRepository.save(reaction);
        return toResponse(saved);
    }

    @Transactional
    public void deleteReaction(Long id, HttpServletRequest request) {
        Device device = deviceService.getRequestingDevice(request);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        ChatMessageReaction reaction = reactionRepository.findById(id)
                .orElseThrow(() -> new AccessDeniedException("Reaction not found"));

        if (!isAdmin && !reaction.getDevice().getId().equals(device.getId())) {
            throw new AccessDeniedException("Not authorized to delete this reaction");
        }

        reactionRepository.delete(reaction);
    }

    @Transactional
    public List<ChatReactionResponse> getReactions(Long messageId) {
        return reactionRepository.findByMessageIdOrderByCreatedAt(messageId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<ChatReactionCountResponse> getReactionSummary(Long messageId) {
        return reactionRepository.countByMessageIdGroupByEmoji(messageId);
    }

    private ChatReactionResponse toResponse(ChatMessageReaction reaction) {
        return new ChatReactionResponse(
                reaction.getId(),
                reaction.getEmoji(),
                reaction.getMessage() != null ? reaction.getMessage().getId() : null,
                reaction.getDevice() != null ? reaction.getDevice().getId() : null,
                reaction.getDevice() != null ? reaction.getDevice().getName() : null
        );
    }
}
