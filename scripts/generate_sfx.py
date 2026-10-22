import numpy as np
import scipy.io.wavfile as wav
import subprocess, imageio_ffmpeg, os

sr = 44100
os.makedirs(r'D:\Karir\Competition\Lomba Game\Stat-Casecode\public\audio', exist_ok=True)
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

def save_and_convert(name, audio_data):
    # Normalize to -1 to 1 with headroom
    peak = np.max(np.abs(audio_data))
    if peak > 0:
        audio_data = (audio_data / peak) * 0.92
    wav_data = (audio_data * 32767).astype(np.int16)
    
    wav_path = rf'D:\Karir\Competition\Lomba Game\Stat-Casecode\public\audio\{name}.wav'
    mp3_path = rf'D:\Karir\Competition\Lomba Game\Stat-Casecode\public\audio\{name}.mp3'
    
    wav.write(wav_path, sr, wav_data)
    # Convert to MP3 as well
    subprocess.run([ffmpeg, '-y', '-i', wav_path, '-c:a', 'libmp3lame', '-b:a', '128k', mp3_path], 
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f'Generated {name}.wav and {name}.mp3')

# 1. SFX_CLICK: Snappy, wooden-tactile UI pop/click (Animal Crossing / Nintendo Style)
def make_click():
    dur = 0.065 # 65ms
    t = np.linspace(0, dur, int(sr * dur), False)
    # Fast frequency pitch drop (1200 Hz down to 320 Hz)
    freq_env = 320 + 880 * np.exp(-t * 85)
    phase = 2 * np.pi * np.cumsum(freq_env) / sr
    
    # Body tone (sine + gentle triangle overtone)
    body = np.sin(phase) + 0.35 * np.sin(phase * 2) + 0.15 * np.sin(phase * 3)
    
    # Click transient burst at start (first 3ms)
    noise = np.random.uniform(-1, 1, len(t))
    transient_env = np.exp(-t * 900)
    
    # Amplitude envelope: Instant attack, smooth exponential decay
    amp_env = np.exp(-t * 65)
    
    sig = (body * 0.75 + noise * transient_env * 0.45) * amp_env
    return sig

# 2. SFX_CONFIRM: Bright, cheerful 2-note chime (E5 -> B5)
def make_confirm():
    dur = 0.22 # 220ms
    t = np.linspace(0, dur, int(sr * dur), False)
    
    # Note 1: E5 (659 Hz) for 60ms
    # Note 2: B5 (987 Hz) with bell-like decay
    sig = np.zeros_like(t)
    
    # Note 1
    t1 = t[t < 0.08]
    env1 = np.exp(-t1 * 35)
    sig[:len(t1)] += (np.sin(2 * np.pi * 659.25 * t1) + 0.3 * np.sin(2 * np.pi * 1318.5 * t1)) * env1 * 0.7
    
    # Note 2
    idx2 = int(sr * 0.055)
    t2 = t[idx2:] - t[idx2]
    env2 = np.exp(-t2 * 22)
    sig[idx2:] += (np.sin(2 * np.pi * 987.77 * t2) + 0.4 * np.sin(2 * np.pi * 1975.5 * t2) + 0.15 * np.sin(2 * np.pi * 2963.2 * t2)) * env2 * 0.9
    return sig

# 3. SFX_CANCEL: Soft gentle descending tap (480 Hz -> 260 Hz)
def make_cancel():
    dur = 0.08
    t = np.linspace(0, dur, int(sr * dur), False)
    freq_env = 260 + 220 * np.exp(-t * 50)
    phase = 2 * np.pi * np.cumsum(freq_env) / sr
    body = np.sin(phase) + 0.2 * np.sin(phase * 2)
    amp_env = np.exp(-t * 45)
    return body * amp_env

# 4. SFX_HOVER: Very subtle high-frequency tick (1400 Hz, 25ms, very soft)
def make_hover():
    dur = 0.025
    t = np.linspace(0, dur, int(sr * dur), False)
    sig = np.sin(2 * np.pi * 1400 * t) * np.exp(-t * 160)
    return sig * 0.4

save_and_convert('sfx_click', make_click())
save_and_convert('sfx_confirm', make_confirm())
save_and_convert('sfx_cancel', make_cancel())
save_and_convert('sfx_hover', make_hover())
print('All sound effects generated successfully!')
