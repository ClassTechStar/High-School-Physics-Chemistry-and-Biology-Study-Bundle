// ============================================================
// app.js — HSPCB 平台核心（已拆分）
// 包含: 全局变量/学科内容数据/导航/模块加载器
// 拆分文件: app-chemistry.js / app-physics.js / app-biology.js / app-exam.js
// 加载顺序: app.js -> app-chemistry.js -> app-physics.js -> app-biology.js -> app-exam.js
// ============================================================

let currentSubject = 'home';
let currentTool = null;

const subjectContent = {
    physics: {
        knowledge: `
            <div class="knowledge-section">
                <h3>📚 物理知识点总结</h3>

                <div class="knowledge-card">
                    <h4>第一章 运动的描述</h4>
                    <div class="key-point">质点：忽略物体大小和形状，突出"物体具有质量"这一要素的点</div>
                    <div class="key-point">参考系：描述物体运动时，选作标准的物体</div>
                    <div class="key-point">位移：描述位置变化，是矢量，有大小和方向</div>
                    <div class="key-point">速度：v=Δx/Δt，描述物体运动快慢和方向</div>
                    <div class="key-point">加速度：a=Δv/Δt，描述速度变化的快慢</div>
                    <div class="common-mistake">常见错误：混淆位移与路程，位移是矢量，路程是标量</div>
                </div>

                <div class="knowledge-card">
                    <h4>第二章 相互作用与力</h4>
                    <div class="key-point">重力：G=mg，方向竖直向下</div>
                    <div class="key-point">弹力：胡克定律F=kx</div>
                    <div class="key-point">摩擦力：静摩擦0<f≤F_max，滑动摩擦f=μN</div>
                    <div class="key-point">力的合成与分解：平行四边形定则</div>
                    <div class="key-point">共点力平衡条件：ΣF=0</div>
                    <div class="common-mistake">常见错误：认为摩擦力一定是阻力</div>
                </div>

                <div class="knowledge-card">
                    <h4>第三章 牛顿运动定律</h4>
                    <div class="key-point">牛顿第一定律：惯性定律，一切物体保持匀速直线运动或静止状态</div>
                    <div class="key-point">牛顿第二定律：F=ma，加速度与合外力同向</div>
                    <div class="key-point">牛顿第三定律：作用力与反作用力大小相等、方向相反</div>
                    <div class="key-point">超重与失重：视重与实际重力的差值</div>
                    <div class="common-mistake">常见错误：认为作用力与反作用力是平衡力</div>
                </div>

                <div class="knowledge-card">
                    <h4>第四章 机械能</h4>
                    <div class="key-point">功：W=Flcosα，正功、负功、零功的判断</div>
                    <div class="key-point">功率：P=W/t，P=Fv（瞬时功率）</div>
                    <div class="key-point">动能：Ek=½mv²，动能定理W=ΔEk</div>
                    <div class="key-point">势能：重力势能Ep=mgh，弹性势能Ep=½kx²</div>
                    <div class="key-point">机械能守恒定律：只有重力或弹力做功时，机械能守恒</div>
                    <div class="common-mistake">常见错误：重力势能正负号意义不清</div>
                </div>

                <div class="knowledge-card">
                    <h4>第五章 动量</h4>
                    <div class="key-point">动量：p=mv，矢量</div>
                    <div class="key-point">动量定理：I=Δp</div>
                    <div class="key-point">动量守恒定律：系统合外力为零时，总动量不变</div>
                    <div class="key-point">碰撞：弹性碰撞、完全非弹性碰撞、非弹性碰撞</div>
                    <div class="common-mistake">常见错误：动量守恒条件判断错误</div>
                </div>

                <div class="knowledge-card">
                    <h4>第六章 静电场</h4>
                    <div class="key-point">电荷守恒定律：系统电荷代数和不变</div>
                    <div class="key-point">库仑定律：F=kq₁q₂/r²</div>
                    <div class="key-point">电场强度：E=F/q，矢量，方向规定为正电荷受力方向</div>
                    <div class="key-point">电势能、电势、电势差：Eₚ=qφ，U=Eₚ/q</div>
                    <div class="key-point">电容：C=Q/U，决定式C=εS/(4πkd)</div>
                    <div class="common-mistake">常见错误：混淆电场强度和电势，电场强度是矢量，电势是标量</div>
                </div>

                <div class="knowledge-card">
                    <h4>第七章 直流电路</h4>
                    <div class="key-point">电流：I=q/t，方向为正电荷移动方向</div>
                    <div class="key-point">电阻定律：R=ρl/S</div>
                    <div class="key-point">欧姆定律：I=U/R</div>
                    <div class="key-point">电功：W=UIt，电功率：P=UI</div>
                    <div class="key-point">串并联电路特点：串联分压、并联分流</div>
                    <div class="key-point">闭合电路欧姆定律：I=E/(R+r)</div>
                    <div class="common-mistake">常见错误：混淆电动势与路端电压</div>
                </div>

                <div class="knowledge-card">
                    <h4>第八章 磁场</h4>
                    <div class="key-point">磁感应强度：B=F/(IL)，描述磁场强弱</div>
                    <div class="key-point">安培力：F=BIL（I⊥B），左手定则</div>
                    <div class="key-point">洛伦兹力：F=qvB（v⊥B），左手定则</div>
                    <div class="key-point">带电粒子在磁场中的运动：匀速圆周运动，r=mv/(qB)，T=2πm/(qB)</div>
                    <div class="common-mistake">常见错误：左手定则与右手定则混淆</div>
                </div>

                <div class="knowledge-card">
                    <h4>第九章 电磁感应</h4>
                    <div class="key-point">磁通量：Φ=BS，变化产生感应电动势</div>
                    <div class="key-point">法拉第电磁感应定律：E=nΔΦ/Δt</div>
                    <div class="key-point">楞次定律：感应电流的磁场阻碍原磁场变化</div>
                    <div class="key-point">自感现象：自感电动势E=LΔI/Δt</div>
                    <div class="key-point">交变电流：e=Eₘsinωt</div>
                    <div class="common-mistake">常见错误：感应电流方向判断错误</div>
                </div>

                <div class="knowledge-card">
                    <h4>第十章 几何光学</h4>
                    <div class="key-point">光的直线传播：同种均匀介质中光沿直线传播</div>
                    <div class="key-point">光的反射：反射定律，反射角等于入射角</div>
                    <div class="key-point">光的折射：n=sin i/sin r，折射率n>1</div>
                    <div class="key-point">全反射：sin C=1/n，临界角C</div>
                    <div class="key-point">透镜成像规律：1/u+1/v=1/f</div>
                    <div class="common-mistake">常见错误：全反射条件判断错误</div>
                </div>

                <div class="knowledge-card">
                    <h4>第十一章 波动光学</h4>
                    <div class="key-point">光的干涉：双缝干涉明纹条件Δx=λL/d</div>
                    <div class="key-point">光的衍射：单缝衍射，中央明纹最亮</div>
                    <div class="key-point">光的偏振：横波特有现象</div>
                    <div class="key-point">电磁波谱：无线电波→红外线→可见光→紫外线→X射线→γ射线</div>
                    <div class="common-mistake">常见错误：干涉与衍射混淆</div>
                </div>

                <div class="knowledge-card">
                    <h4>第十二章 热学</h4>
                    <div class="key-point">分子动理论：物体由大量分子组成，分子在做永不停息的无规则运动</div>
                    <div class="key-point">温度：分子平均动能的标志</div>
                    <div class="key-point">内能：物体内所有分子动能和势能的总和</div>
                    <div class="key-point">热力学第一定律：ΔU=Q+W</div>
                    <div class="key-point">气体实验定律：玻意耳定律、查理定律、盖·吕萨克定律</div>
                    <div class="key-point">理想气体状态方程：PV=nRT</div>
                    <div class="common-mistake">常见错误：温度单位必须用热力学温标</div>
                </div>

                <div class="knowledge-card">
                    <h4>第十三章 机械振动</h4>
                    <div class="key-point">简谐运动：F=-kx，回复力与位移成正比</div>
                    <div class="key-point">振幅A：振动物体离开平衡位置的最大距离</div>
                    <div class="key-point">周期T：完成一次全振动的时间</div>
                    <div class="key-point">频率f：单位时间内完成全振动的次数，f=1/T</div>
                    <div class="key-point">单摆周期：T=2π√(l/g)</div>
                    <div class="key-point">受迫振动：物体在周期性外力作用下的振动</div>
                    <div class="key-point">共振：受迫振动频率等于固有频率时，振幅最大</div>
                    <div class="common-mistake">常见错误：混淆周期和频率的关系</div>
                </div>

                <div class="knowledge-card">
                    <h4>第十四章 机械波</h4>
                    <div class="key-point">机械波：机械振动在介质中的传播</div>
                    <div class="key-point">横波：质点振动方向与波传播方向垂直</div>
                    <div class="key-point">纵波：质点振动方向与波传播方向平行</div>
                    <div class="key-point">波长λ：相邻波峰或波谷之间的距离</div>
                    <div class="key-point">波速v：波传播的速度，v=λ/T=λf</div>
                    <div class="key-point">波的干涉：两列相干波叠加，形成稳定干涉图样</div>
                    <div class="key-point">波的衍射：波绕过障碍物传播的现象</div>
                    <div class="common-mistake">常见错误：混淆波速与质点振动速度</div>
                </div>

                <div class="knowledge-card">
                    <h4>第十五章 原子物理</h4>
                    <div class="key-point">原子结构：核式结构（原子核+核外电子）</div>
                    <div class="key-point">氢原子光谱：巴尔末公式1/λ=R(1/2²-1/n²)</div>
                    <div class="key-point">玻尔理论：能量量子化，稳定态假设，频率条件</div>
                    <div class="key-point">能级跃迁：hν=Eₙ-Eₘ</div>
                    <div class="key-point">原子核组成：质子+中子</div>
                    <div class="key-point">天然放射现象：α、β、γ三种射线</div>
                    <div class="key-point">半衰期：放射性元素原子核数减半所需时间</div>
                    <div class="key-point">核反应方程：质量数守恒、电荷数守恒</div>
                    <div class="key-point">爱因斯坦质能方程：E=mc²</div>
                    <div class="common-mistake">常见错误：混淆衰变次数与半衰期</div>
                </div>

                <div class="knowledge-card">
                    <h4>第十六章 光电效应</h4>
                    <div class="key-point">光电效应：光子照射金属表面发射电子的现象</div>
                    <div class="key-point">爱因斯坦光电方程：Eₖ=hv-W₀</div>
                    <div class="key-point">最大初动能：电子逸出金属表面时的最大动能</div>
                    <div class="key-point">逸出功W₀：使电子逸出金属表面所需最小能量</div>
                    <div class="key-point">截止频率：使金属发生光电效应的最小频率</div>
                    <div class="key-point">光子能量：E=hv=h(c/λ)</div>
                    <div class="common-mistake">常见错误：认为光电子数目与入射光频率成正比</div>
                </div>

                <div class="knowledge-card">
                    <h4>附录一：常用仪器读数与估读规则</h4>
                    <div class="key-point"><strong>核心原则：</strong>使读数的最后一位（估读位）与仪器误差所在位对齐，误差取最小分度值的一半</div>
                    <div class="key-point"><strong>需要估读：</strong>刻度尺、螺旋测微器、电流表、电压表、弹簧测力计（刻度线可连续变化）</div>
                    <div class="key-point"><strong>不需估读：</strong>游标卡尺、机械秒表、电阻箱、数字式仪表（示数跳跃变化）</div>
                    <div class="key-point"><strong>估读口诀：</strong>"见1（含0.1）估下位，见2估半格（同一位），见5估五份（同一位）"</div>
                </div>

                <div class="knowledge-card">
                    <h4>附录二：刻度尺与螺旋测微器</h4>
                    <div class="key-point"><strong>刻度尺：</strong>估读到最小分度值下一位。毫米尺(精度1mm)读到0.1mm位。如13.55cm，"13.5"为准确值，"0.05"为估读值。末端对准整刻度线时记录为21.00cm</div>
                    <div class="key-point"><strong>螺旋测微器读数三步法：</strong>①读固定刻度（注意半毫米刻线是否露出）②读可动刻度（哪条线与基线对齐）③相加：测量值=固定刻度+可动刻度格数×0.01mm</div>
                    <div class="key-point"><strong>小数位规则：</strong>以mm为单位，小数点后必须有三位（最后一位为估读位），精度0.01mm，1/10估读到0.001mm</div>
                    <div class="common-mistake">常见错误：螺旋测微器忘记检查半毫米刻线是否露出；刻度尺末端对准整刻度时未补零</div>
                </div>

                <div class="knowledge-card">
                    <h4>附录三：游标卡尺</h4>
                    <div class="key-point"><strong>读数三步法（无需估读）：</strong>①主尺整数：游标"0"线左侧最近的整毫米刻度 ②游标小数：找到游标上与主尺对齐的第n条线，小数=n×精度 ③相加得结果</div>
                    <div class="key-point"><strong>10分度：</strong>精度0.1mm，结果1位小数，如23.4mm</div>
                    <div class="key-point"><strong>20分度：</strong>精度0.05mm，结果2位小数（末位0或5），如23.40mm或23.45mm</div>
                    <div class="key-point"><strong>50分度：</strong>精度0.02mm，结果2位小数（末位偶数），如23.42mm</div>
                    <div class="common-mistake">常见错误：游标卡尺误估读；不同分度精度混淆</div>
                </div>

                <div class="knowledge-card">
                    <h4>附录四：电流表与电压表估读</h4>
                    <div class="key-point"><strong>电流表：</strong>串联，"+"进"-"出，严禁直接接电源。先估测或用"试触法"选量程（指针偏转超过满偏1/3，最好在2/3左右）</div>
                    <div class="key-point"><strong>电压表：</strong>并联，"+"接高电势端</div>
                    <div class="key-point"><strong>最小分度为"1"（如0.1A, 0.1V）：</strong>1/10估读法，估读到下一位。如0~3A档读数1.23A</div>
                    <div class="key-point"><strong>最小分度为"2"（如0.02A, 0.2V）：</strong>1/2估读法（半格估读），估读到同一位。如0~0.6A档读数0.45A</div>
                    <div class="key-point"><strong>最小分度为"5"（如0.5V, 0.05A）：</strong>1/5估读法，估读到同一位。如0~15V档读数11.7V</div>
                    <div class="common-mistake">常见错误：不同量程估读方法混淆；电流表并联使用</div>
                </div>

                <div class="knowledge-card">
                    <h4>附录五：多用电表与电表改装</h4>
                    <div class="key-point"><strong>多用电表通用步骤：</strong>机械调零→插好表笔(红+黑-)→选功能和量程→测量→用毕置于OFF或交流最高档</div>
                    <div class="key-point"><strong>欧姆档使用：</strong>选倍率(使指针指中值附近)→欧姆调零(短接表笔调零)→测量(电阻与电路断开)→读数=示数×倍率。每次换挡必须重新调零！</div>
                    <div class="key-point"><strong>改装电压表：</strong>串联大电阻分压，R=U/Ig-Rg，内阻RV=Rg+R（很大），测量时并联</div>
                    <div class="key-point"><strong>改装电流表：</strong>并联小电阻分流，R=(Ig×Rg)/(I-Ig)，内阻RA=(Rg×R)/(Rg+R)（很小），测量时串联</div>
                    <div class="key-point"><strong>欧姆表原理：</strong>I=E/(R内+Rx)，刻度不均匀（左密右疏），中值电阻=内阻</div>
                    <div class="key-point"><strong>记忆口诀：</strong>"电压串联大电阻，电流并联小电阻；电压并着测，电流串着测"；"换挡必调零，刻度反着读，中阻即内阻"</div>
                    <div class="common-mistake">常见错误：欧姆档换挡后忘记重新调零；电表改装公式混淆</div>
                </div>
            </div>
        `,
        examples: `
            <div class="examples-section">
                <h3>📝 典型例题</h3>

                <div class="knowledge-card">
                    <h4>例题1：运动学计算</h4>
                    <p>一个物体从静止开始做匀加速直线运动，已知第3秒内的位移为6m，则物体的加速度为多少？</p>
                    <div class="key-point">解答：第3秒内的位移等于前3秒位移减去前2秒位移。设加速度为a，前3秒位移x₃=½a·9=4.5a，前2秒位移x₂=½a·4=2a，第3秒位移Δx=x₃-x₂=2.5a=6m，解得a=2.4m/s²。</div>
                    <div class="common-mistake">常见错误：直接用x₃=½a·9=6m，解得a=4/3m/s²</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题2：摩擦力计算</h4>
                    <p>在水平地面上放置一个质量为2kg的物体，若它受到10N的水平拉力后做匀速直线运动，则物体与地面间的动摩擦因数μ为多少？</p>
                    <div class="key-point">解答：匀速运动时，拉力与摩擦力平衡，f=μmg=10N，所以μ=10/(2×10)=0.5。</div>
                    <div class="common-mistake">常见错误：忘记乘以g，直接计算μ=10/2=5</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题3：电场强度与电势</h4>
                    <p>在点电荷Q的电场中，距离Q为r的A点场强为E，电势为φ。则以下说法正确的是：</p>
                    <p style="color: var(--gray);">A. E与r²成反比，φ与r成正比</p>
                    <p style="color: var(--gray);">B. E与r²成反比，φ与r成反比</p>
                    <p style="color: var(--gray);">C. E与r成正比，φ与r成反比</p>
                    <p style="color: var(--gray);">D. E与r成正比，φ与r成正比</p>
                    <div class="key-point">答案：B</div>
                    <div class="common-mistake">E=kQ/r²，φ=kQ/r</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题4：原子跃迁</h4>
                    <p>氢原子从n=3的能级跃迁到n=1的能级时，辐射光子的波长为多少？（R=1.097×10⁷m⁻¹）</p>
                    <div class="key-point">解答：1/λ=R(1/1²-1/3²)=R(8/9)，λ=9/(8R)=1.025×10⁻⁷m</div>
                    <div class="common-mistake">计算时注意单位统一</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题5：理想气体状态方程</h4>
                    <p>一容器内盛有理想气体，温度为27°C，压强为2×10⁵Pa。则该气体在127°C时的压强为多少？</p>
                    <div class="key-point">解答：T₁=300K，T₂=400K，P₁/T₁=P₂/T₂，2×10⁵/300=P₂/400，P₂=2.67×10⁵Pa</div>
                    <div class="common-mistake">温度必须用热力学温标</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题6：光电效应</h4>
                    <p>某金属的逸出功为3.68×10⁻¹⁹J，用波长为300nm的光照射该金属，求光电子的最大初动能。</p>
                    <div class="key-point">解答：E=hc/λ=6.63×10⁻³⁴×3×10⁸/(300×10⁻⁹)=6.63×10⁻¹⁹J</div>
                    <div class="key-point">Eₖ=hv-W₀=6.63×10⁻¹⁹-3.68×10⁻¹⁹=2.95×10⁻¹⁹J</div>
                    <div class="common-mistake">计算时注意单位换算</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题7：简谐运动周期</h4>
                    <p>一弹簧振子的周期为2s，若将弹簧剪掉一半，振子周期变为多少？</p>
                    <div class="key-point">解答：T=2π√(m/k)，k与弹簧长度成反比，减半后k变为2k</div>
                    <div class="key-point">T'=2π√(m/2k)=T/√2=√2s≈1.41s</div>
                    <div class="common-mistake">弹簧减半，劲度系数加倍</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题8：波的干涉</h4>
                    <p>两列相干波在P点相遇，波程差为3λ，则P点是振动加强点还是减弱点？</p>
                    <div class="key-point">解答：波程差=3λ=3×λ，满足Δs=nλ（n=3），所以P点是振动加强点</div>
                    <div class="common-mistake">加强条件：Δs=nλ；减弱条件：Δs=(2n+1)λ/2</div>
                </div>
            </div>
        `,
        experiments: `
            <div class="experiments-section">
                <h3>🔬 实验指导</h3>

                <div class="knowledge-card">
                    <h4>实验：测速度</h4>
                    <p><strong>实验目的：</strong>学会使用打点计时器测速度，区分平均速度和瞬时速度</p>
                    <p><strong>实验原理：</strong>利用打点计时器记录物体运动的时间间隔，通过纸带上的点间距计算速度</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>把打点计时器固定在实验台上</li>
                        <li>将纸带穿过打点计时器，另一端连接运动物体</li>
                        <li>先接通电源，后释放纸带</li>
                        <li>取纸带后关闭电源</li>
                        <li>选取计数点，测量相邻计数点间距</li>
                        <li>计算各段平均速度和瞬时速度</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>打点计时器必须先通电后释放纸带</li>
                        <li>选取纸带时，应选点迹清晰且连续的</li>
                        <li>计数点间隔选取要合理</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>实验：测定金属的电阻率</h4>
                    <p><strong>实验目的：</strong>学会用伏安法测电阻，测定金属的电阻率</p>
                    <p><strong>实验原理：</strong>R=ρl/S，通过测量长度l、电压U、电流I，计算电阻ρ</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>用刻度尺测量金属丝长度</li>
                        <li>用螺旋测微器测量直径</li>
                        <li>按电路图连接电路</li>
                        <li>闭合开关，调节变阻器</li>
                        <li>读取多组U、I值</li>
                        <li>计算电阻率</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>电流不宜过大</li>
                        <li>电压表内接法适合测大电阻</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>实验：测定玻璃的折射率</h4>
                    <p><strong>实验目的：</strong>用插针法测定玻璃的折射率</p>
                    <p><strong>实验原理：</strong>n=sin i/sin r</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>将玻璃砖放在白纸上，描出界面aa'和bb'</li>
                        <li>在aa'一侧插两枚大头针P₁、P₂</li>
                        <li>在bb'一侧观察P₁、P₂的像，插P₃、P₄使其与像共线</li>
                        <li>画出光路，测量入射角i和折射角r</li>
                        <li>计算折射率n</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>大头针要竖直插牢</li>
                        <li>入射角不能太大（避免全反射）</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>实验：用双缝干涉测光的波长</h4>
                    <p><strong>实验目的：</strong>测定单色光的波长</p>
                    <p><strong>实验原理：</strong>条纹间距Δx=λL/d</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>安装双缝干涉仪，调整光路</li>
                        <li>调节单缝使光源发出清晰干涉条纹</li>
                        <li>测量n条亮纹间的距离</li>
                        <li>计算相邻亮纹间距Δx</li>
                        <li>已知L、d，计算波长λ=Δx·d/L</li>
                    </ol>
                </div>

                <div class="knowledge-card">
                    <h4>实验：验证动量守恒定律</h4>
                    <p><strong>实验目的：</strong>验证碰撞中的动量守恒</p>
                    <p><strong>实验原理：</strong>m₁v₁+m₂v₂=m₁v₁'+m₂v₂'</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>用天平称量两球质量m₁、m₂</li>
                        <li>按图安装实验装置</li>
                        <li>让小球从斜槽某一高度滚下</li>
                        <li>记录落地点位置</li>
                        <li>重复实验多次</li>
                        <li>验证动量守恒</li>
                    </ol>
                </div>

                <div class="knowledge-card">
                    <h4>实验：验证单摆周期公式</h4>
                    <p><strong>实验目的：</strong>验证单摆周期与摆长的关系</p>
                    <p><strong>实验原理：</strong>T=2π√(l/g)</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>安装单摆，摆长约1m</li>
                        <li>测出摆长l</li>
                        <li>让单摆做小角度摆动</li>
                        <li>测出30-50次全振动的时间t</li>
                        <li>计算周期T=t/n</li>
                        <li>改变摆长，重复实验</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>摆角小于5°</li>
                        <li>摆线要细且不易伸长</li>
                    </ul>
                </div>
            </div>
        `,
        tests: `
            <div class="tests-section">
                <h3>📋 模拟测试</h3>

                <div class="knowledge-card">
                    <h4>基础巩固</h4>
                    <p>1. 关于位移和路程的说法，正确的是（ ）</p>
                    <p style="color: var(--gray);">A. 位移的大小一定大于路程</p>
                    <p style="color: var(--gray);">B. 物体做直线运动时，位移的大小等于路程</p>
                    <p style="color: var(--gray);">C. 位移是矢量，路程是标量</p>
                    <p style="color: var(--gray);">D. 位移取决于初始位置和终止位置，与路径无关</p>
                    <p style="color: var(--secondary);">答案：C、D</p>
                </div>

                <div class="knowledge-card">
                    <h4>能力提升</h4>
                    <p>2. 一个物体从H高处自由下落，经时间t落地，则当它下落t/2时，离地面的高度为（ ）</p>
                    <p style="color: var(--gray);">A. H/2</p>
                    <p style="color: var(--gray);">B. H/4</p>
                    <p style="color: var(--gray);">C. 3H/4</p>
                    <p style="color: var(--gray);">D. H</p>
                    <p style="color: var(--secondary);">答案：C</p>
                </div>

                <div class="knowledge-card">
                    <h4>高考冲刺</h4>
                    <p>3. 在光滑水平面上，一质量为m的小球以速度v撞击静止的相同质量的小球，碰撞后它们的速度可能为（ ）</p>
                    <p style="color: var(--gray);">A. v和0</p>
                    <p style="color: var(--gray);">B. 0和v</p>
                    <p style="color: var(--gray);">C. v/2和v/2</p>
                    <p style="color: var(--gray);">D. 0和0</p>
                    <p style="color: var(--secondary);">答案：C</p>
                </div>

                <div class="knowledge-card">
                    <h4>高考冲刺</h4>
                    <p>4. 一束光从空气射入玻璃，已知入射角为60°，折射角为30°，则玻璃的折射率为（ ）</p>
                    <p style="color: var(--gray);">A. √3</p>
                    <p style="color: var(--gray);">B. √3/3</p>
                    <p style="color: var(--gray);">C. 1/√3</p>
                    <p style="color: var(--gray);">D. √2</p>
                    <p style="color: var(--secondary);">答案：A（n=sin60°/sin30°=√3）</p>
                </div>

                <div class="knowledge-card">
                    <h4>高考冲刺</h4>
                    <p>5. 氢原子的基态能量为-13.6eV，则氢原子从n=3跃迁到n=1时，辐射光子的能量为（ ）</p>
                    <p style="color: var(--gray);">A. 12.09eV</p>
                    <p style="color: var(--gray);">B. 10.2eV</p>
                    <p style="color: var(--gray);">C. 1.89eV</p>
                    <p style="color: var(--gray);">D. 3.4eV</p>
                    <p style="color: var(--secondary);">答案：A（ΔE=-13.6/9-(-13.6)=12.09eV）</p>
                </div>

                <div class="knowledge-card">
                    <h4>高考冲刺</h4>
                    <p>6. 一定量的理想气体，体积膨胀时（ ）</p>
                    <p style="color: var(--gray);">A. 分子平均动能一定增大</p>
                    <p style="color: var(--gray);">B. 气体一定对外做功</p>
                    <p style="color: var(--gray);">C. 气体一定吸热</p>
                    <p style="color: var(--gray);">D. 内能一定增加</p>
                    <p style="color: var(--secondary);">答案：B</p>
                </div>

                <div class="knowledge-card">
                    <h4>高考冲刺</h4>
                    <p>7. 两列相干波在空间相遇，某点恰为振动加强点，则该点到两波源的距离差为（ ）</p>
                    <p style="color: var(--gray);">A. λ/2的奇数倍</p>
                    <p style="color: var(--gray);">B. λ的整数倍</p>
                    <p style="color: var(--gray);">C. λ/2的整数倍</p>
                    <p style="color: var(--gray);">D. 3λ/4</p>
                    <p style="color: var(--secondary);">答案：B（加强：Δs=nλ）</p>
                </div>

                <div class="knowledge-card">
                    <h4>高考冲刺</h4>
                    <p>8. 光电效应中，光电子的最大初动能与入射光的关系是（ ）</p>
                    <p style="color: var(--gray);">A. 与入射光强度成正比</p>
                    <p style="color: var(--gray);">B. 与入射光频率成正比</p>
                    <p style="color: var(--gray);">C. 与入射光频率成线性关系</p>
                    <p style="color: var(--gray);">D. 与入射光波长成反比</p>
                    <p style="color: var(--secondary);">答案：C</p>
                </div>
            </div>
        `
    },
    chemistry: {
        knowledge: `
            <div class="knowledge-section">
                <h3>📚 化学知识点总结</h3>

                <div class="knowledge-card">
                    <h4>第一章 化学计量</h4>
                    <div class="key-point">物质的量(n)：表示含有一定数目粒子的集合体，单位mol</div>
                    <div class="key-point">阿伏伽德罗常数(NA)：6.02×10²³ mol⁻¹</div>
                    <div class="key-point">摩尔质量(M)：单位物质的量的物质所具有的质量，g/mol</div>
                    <div class="key-point">气体摩尔体积(Vm)：标准状况下，1mol任何气体的体积约为22.4L</div>
                    <div class="key-point">物质的量浓度(c)：c=n/V，单位mol/L</div>
                    <div class="key-point">配制一定物质的量浓度溶液的步骤：计算→称量→溶解→冷却→转移→洗涤→定容→摇匀</div>
                    <div class="common-mistake">常见错误：气体摩尔体积22.4L/mol仅适用于标准状况；容量瓶不能用于溶解或稀释</div>
                </div>

                <div class="knowledge-card">
                    <h4>第二章 离子反应</h4>
                    <div class="key-point">电解质：在水溶液或熔融状态下能导电的化合物（酸、碱、盐）</div>
                    <div class="key-point">非电解质：在水溶液和熔融状态下均不能导电的化合物（蔗糖、酒精等）</div>
                    <div class="key-point">强电解质：完全电离（强酸、强碱、大多数盐）</div>
                    <div class="key-point">弱电解质：部分电离（弱酸、弱碱、水）</div>
                    <div class="key-point">离子反应发生的条件：生成沉淀、气体、弱电解质或发生氧化还原反应</div>
                    <div class="key-point">离子方程式书写步骤：写→拆→删→查</div>
                    <div class="common-mistake">常见错误：离子方程式拆写错误（如CaCO₃写成Ca²⁺+CO₃²⁻）；弱电解质不能拆</div>
                </div>

                <div class="knowledge-card">
                    <h4>第三章 氧化还原反应</h4>
                    <div class="key-point">氧化反应：失去电子（或化合价升高）</div>
                    <div class="key-point">还原反应：得到电子（或化合价降低）</div>
                    <div class="key-point">氧化剂：得电子，化合价降低，被还原，发生还原反应</div>
                    <div class="key-point">还原剂：失电子，化合价升高，被氧化，发生氧化反应</div>
                    <div class="key-point">氧化还原反应规律：电子守恒、化合价升降总数相等</div>
                    <div class="key-point">常见氧化剂：O₂、Cl₂、HNO₃、KMnO₄、浓H₂SO₄</div>
                    <div class="key-point">常见还原剂：Na、Fe、C、CO、H₂、SO₂</div>
                    <div class="common-mistake">常见错误：氧化剂被还原（不是被氧化）；还原剂被氧化（不是被还原）</div>
                </div>

                <div class="knowledge-card">
                    <h4>第四章 电化学</h4>
                    <div class="key-point">原电池：化学能转化为电能，负极氧化、正极还原</div>
                    <div class="key-point">原电池构成条件：两个活泼性不同的电极、电解质溶液、形成闭合回路、自发氧化还原反应</div>
                    <div class="key-point">电解池：电能转化为化学能，阳极氧化、阴极还原</div>
                    <div class="key-point">金属腐蚀：化学腐蚀与电化学腐蚀（吸氧腐蚀为主）</div>
                    <div class="key-point">金属防护：牺牲阳极阴极保护法、外加电流阴极保护法</div>
                    <div class="common-mistake">常见错误：原电池正负极判断错误；电解池阴阳极与电源正负极对应关系混淆</div>
                </div>

                <div class="knowledge-card">
                    <h4>第五章 元素周期律与周期表</h4>
                    <div class="key-point">元素周期表结构：7个周期（3短3长1不完全）、16族（7主7副1Ⅷ10）</div>
                    <div class="key-point">同周期从左到右：原子半径减小、金属性减弱、非金属性增强</div>
                    <div class="key-point">同主族从上到下：原子半径增大、金属性增强、非金属性减弱</div>
                    <div class="key-point">金属性判断依据：与水/酸反应剧烈程度、最高价氧化物水化物碱性、置换反应</div>
                    <div class="key-point">非金属性判断依据：与H₂化合难易、气态氢化物稳定性、最高价含氧酸酸性</div>
                    <div class="common-mistake">常见错误：混淆金属性与非金属性的递变规律；原子半径比较忽略电子层数</div>
                </div>

                <div class="knowledge-card">
                    <h4>第六章 化学键与物质结构</h4>
                    <div class="key-point">离子键：阴阳离子之间的静电作用（活泼金属与活泼非金属）</div>
                    <div class="key-point">共价键：原子间通过共用电子对形成的化学键（极性键与非极性键）</div>
                    <div class="key-point">金属键：金属阳离子与自由电子之间的作用力</div>
                    <div class="key-point">分子间作用力：范德华力、氢键</div>
                    <div class="key-point">晶体类型：离子晶体、原子晶体、分子晶体、金属晶体</div>
                    <div class="key-point">杂化轨道理论：sp（直线形）、sp²（平面三角形）、sp³（四面体形）</div>
                    <div class="common-mistake">常见错误：分子间作用力不属于化学键；氢键是分子间作用力不是化学键</div>
                </div>

                <div class="knowledge-card">
                    <h4>第七章 化学反应与能量</h4>
                    <div class="key-point">吸热反应：反应物总能量小于生成物总能量</div>
                    <div class="key-point">放热反应：反应物总能量大于生成物总能量</div>
                    <div class="key-point">焓变(ΔH)：ΔH=生成物总能量-反应物总能量</div>
                    <div class="key-point">热化学方程式书写：注明聚集状态、ΔH带正负号、化学计量数可为分数</div>
                    <div class="key-point">盖斯定律：化学反应的反应热只与始态和终态有关，与途径无关</div>
                    <div class="common-mistake">常见错误：ΔH正负号含义混淆；热化学方程式不标状态</div>
                </div>

                <div class="knowledge-card">
                    <h4>第八章 化学反应速率与化学平衡</h4>
                    <div class="key-point">化学反应速率：v=Δc/Δt，单位mol/(L·s)</div>
                    <div class="key-point">影响速率因素：浓度、温度、催化剂、压强（气体）、表面积</div>
                    <div class="key-point">化学平衡状态标志：正反应速率=逆反应速率，各组分浓度不变</div>
                    <div class="key-point">平衡移动原理（勒夏特列原理）：改变条件，平衡向减弱该改变的方向移动</div>
                    <div class="key-point">平衡常数K：K值越大，正反应进行程度越大；K只与温度有关</div>
                    <div class="key-point">转化率α=已反应的量/起始总量×100%</div>
                    <div class="common-mistake">常见错误：催化剂不能使平衡移动；增大压强不一定改变速率（恒容充惰气）</div>
                </div>

                <div class="knowledge-card">
                    <h4>第九章 水溶液中的离子平衡</h4>
                    <div class="key-point">弱电解质电离平衡：电离度α、电离常数Ka/Kb</div>
                    <div class="key-point">水的电离：Kw=[H⁺][OH⁻]=1×10⁻¹⁴(25°C)</div>
                    <div class="key-point">pH=-lg[H⁺]，酸性pH<7，碱性pH>7</div>
                    <div class="key-point">盐类水解：有弱才水解，谁弱谁水解，谁强显谁性</div>
                    <div class="key-point">沉淀溶解平衡：溶度积Ksp，Ksp与溶解度关系</div>
                    <div class="key-point">离子浓度大小比较：物料守恒、电荷守恒、质子守恒</div>
                    <div class="common-mistake">常见错误：盐溶液酸碱性判断错误；离子浓度大小排序遗漏守恒关系</div>
                </div>

                <div class="knowledge-card">
                    <h4>第十章 有机化学基础</h4>
                    <div class="key-point">烷烃(CₙH₂ₙ₊₂)：取代反应为主，甲烷正四面体结构</div>
                    <div class="key-point">烯烃(CₙH₂ₙ)：加成反应、加聚反应，乙烯平面形</div>
                    <div class="key-point">炔烃(CₙH₂ₙ₋₂)：加成反应，乙炔直线形</div>
                    <div class="key-point">苯：特殊结构，兼有加成和取代反应，不能使KMnO₄褪色</div>
                    <div class="key-point">卤代烃：水解反应（NaOH水溶液）、消去反应（NaOH醇溶液）</div>
                    <div class="key-point">醇：与Na反应、催化氧化、消去、酯化</div>
                    <div class="key-point">醛：银镜反应、与新制Cu(OH)₂反应、氧化为酸</div>
                    <div class="key-point">羧酸：酸性、酯化反应</div>
                    <div class="key-point">酯：水解反应（酸性/碱性条件）</div>
                    <div class="common-mistake">常见错误：混淆加成与取代反应条件；醇的催化氧化产物判断错误</div>
                </div>

                <div class="knowledge-card">
                    <h4>第十一章 化学实验基础</h4>
                    <div class="key-point">常用仪器：容量瓶、滴定管、蒸馏烧瓶、分液漏斗</div>
                    <div class="key-point">基本操作：称量、溶解、过滤、蒸发、蒸馏、分液、萃取</div>
                    <div class="key-point">气体制备：发生装置→净化装置→干燥装置→收集装置→尾气处理</div>
                    <div class="key-point">离子检验：Cl⁻(AgNO₃)、SO₄²⁻(BaCl₂)、CO₃²⁻(HCl+石灰水)、Fe³⁺(KSCN)</div>
                    <div class="key-point">安全操作：防倒吸、防暴沸、防污染、尾气处理</div>
                    <div class="common-mistake">常见错误：容量瓶使用方法错误；蒸馏温度计位置错误</div>
                </div>
            </div>
        `,
        examples: `
            <div class="examples-section">
                <h3>📝 典型例题</h3>

                <div class="knowledge-card">
                    <h4>例题1：NA计算</h4>
                    <p>标准状况下，5.6L O₂所含的分子数约为多少？</p>
                    <div class="key-point">解答：n(O₂)=5.6/22.4=0.25mol，N=0.25×6.02×10²³=1.505×10²³</div>
                    <div class="common-mistake">常见错误：直接写成5.6×6.02×10²³</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题2：离子共存</h4>
                    <p>下列离子能在溶液中大量共存的是：</p>
                    <p style="color: var(--gray);">A. Na⁺、Cl⁻、Ag⁺、NO₃⁻</p>
                    <p style="color: var(--gray);">B. K⁺、SO₄²⁻、Ba²⁺、NO₃⁻</p>
                    <p style="color: var(--gray);">C. Na⁺、Cl⁻、K⁺、NO₃⁻</p>
                    <p style="color: var(--gray);">D. Ca²⁺、CO₃²⁻、H⁺、Cl⁻</p>
                    <div class="key-point">答案：C</div>
                    <div class="common-mistake">A中Ag⁺+Cl⁻→AgCl↓；B中Ba²⁺+SO₄²⁻→BaSO₄↓；D中CO₃²⁻+H⁺→CO₂↑+H₂O</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题3：氧化还原反应配平</h4>
                    <p>配平：Cu + HNO₃(稀) → Cu(NO₃)₂ + NO↑ + H₂O</p>
                    <div class="key-point">解答：Cu化合价升高2，N化合价降低3（+5→+2），最小公倍数为6</div>
                    <div class="key-point">3Cu + 8HNO₃(稀) → 3Cu(NO₃)₂ + 2NO↑ + 4H₂O</div>
                    <div class="common-mistake">注意：8mol HNO₃中只有2mol被还原，6mol起酸性作用</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题4：原电池计算</h4>
                    <p>锌铜原电池中，若导线中通过0.2mol电子，求消耗锌的质量和生成铜的质量。</p>
                    <div class="key-point">解答：负极 Zn-2e⁻→Zn²⁺，正极 Cu²⁺+2e⁻→Cu</div>
                    <div class="key-point">n(Zn)=n(e⁻)/2=0.1mol，m(Zn)=0.1×65=6.5g</div>
                    <div class="key-point">n(Cu)=n(e⁻)/2=0.1mol，m(Cu)=0.1×64=6.4g</div>
                    <div class="common-mistake">常见错误：电子转移数与物质的量关系计算错误</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题5：化学平衡计算</h4>
                    <p>在密闭容器中，N₂+3H₂⇌2NH₃，起始时N₂为4mol，H₂为8mol，达平衡时N₂转化率为25%，求H₂转化率和NH₃的体积分数。</p>
                    <div class="key-point">解答：转化的N₂=4×25%=1mol，转化的H₂=3mol，生成的NH₃=2mol</div>
                    <div class="key-point">平衡时：N₂=3mol，H₂=5mol，NH₃=2mol，总量=10mol</div>
                    <div class="key-point">H₂转化率=3/8×100%=37.5%，NH₃体积分数=2/10×100%=20%</div>
                    <div class="common-mistake">常见错误：三段式计算时起始量、转化量、平衡量混淆</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题6：盐类水解</h4>
                    <p>比较等浓度的①CH₃COONa ②NaCl ③NH₄Cl ④NaHCO₃溶液的pH由大到小的顺序。</p>
                    <div class="key-point">解答：④NaHCO₃水解呈碱性(pH>7) > ①CH₃COONa水解呈碱性(pH>7) > ②NaCl不水解(pH=7) > ③NH₄Cl水解呈酸性(pH<7)</div>
                    <div class="key-point">注意：HCO₃⁻水解程度大于CH₃COO⁻，故NaHCO₃碱性更强</div>
                    <div class="common-mistake">常见错误：NaHCO₃和CH₃COONa碱性强弱判断错误</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题7：有机物同分异构体</h4>
                    <p>分子式为C₄H₈的有机物有多少种同分异构体（不考虑立体异构）？</p>
                    <div class="key-point">解答：C₄H₈不饱和度为1，可能是烯烃或环烷烃</div>
                    <div class="key-point">烯烃：CH₂=CHCH₂CH₃(1-丁烯)、CH₃CH=CHCH₃(2-丁烯)、CH₂=C(CH₃)₂(2-甲基丙烯)共3种</div>
                    <div class="key-point">环烷烃：环丁烷、甲基环丙烷共2种</div>
                    <div class="key-point">总计5种同分异构体</div>
                    <div class="common-mistake">常见错误：遗漏环烷烃或2-甲基丙烯</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题8：元素周期律推断</h4>
                    <p>短周期元素X、Y、Z，X原子的最外层电子数是内层的2倍，Y是地壳中含量最多的元素，Z与Y同主族。则下列说法正确的是？</p>
                    <div class="key-point">解答：X最外层是内层2倍→X为C(2,4)；Y地壳含量最多→Y为O；Z与O同主族→Z为S</div>
                    <div class="key-point">原子半径：S>C>O；最高价含氧酸酸性：H₂SO₄>H₂CO₃</div>
                    <div class="key-point">气态氢化物稳定性：H₂O>H₂S</div>
                    <div class="common-mistake">常见错误：原子半径比较忽略电子层数影响</div>
                </div>
            </div>
        `,
        experiments: `
            <div class="experiments-section">
                <h3>🔬 实验指导</h3>

                <div class="knowledge-card">
                    <h4>实验一：酸碱中和滴定</h4>
                    <p><strong>实验目的：</strong>学会用滴定法测定酸或碱的浓度</p>
                    <p><strong>实验原理：</strong>利用酸碱中和反应，按照化学计量数比完全反应，通过已知浓度的溶液测定未知浓度</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>滴定管检漏、洗涤、润洗</li>
                        <li>装入标准液，赶气泡，记录初读数</li>
                        <li>用待测液润洗移液管</li>
                        <li>移取25.00mL待测液于锥形瓶中</li>
                        <li>加入2-3滴酚酞指示剂</li>
                        <li>滴定：边滴边摇，至溶液恰好变色</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>滴定管读数精确到0.01mL</li>
                        <li>锥形瓶不能用待测液润洗</li>
                        <li>滴定终点：半滴标准液使溶液变色且30秒不褪色</li>
                        <li>重复2-3次取平均值</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>实验二：配制一定物质的量浓度溶液</h4>
                    <p><strong>实验目的：</strong>掌握配制一定物质的量浓度溶液的方法</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>计算所需固体质量或液体体积</li>
                        <li>用天平称量（或量筒量取）</li>
                        <li>在烧杯中溶解（或稀释），用玻璃棒搅拌</li>
                        <li>冷却至室温后转移至容量瓶</li>
                        <li>用蒸馏水洗涤烧杯和玻璃棒2-3次，洗涤液转入容量瓶</li>
                        <li>加水至刻度线1-2cm处，改用胶头滴管定容</li>
                        <li>颠倒摇匀</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>容量瓶不能用于溶解或存放溶液</li>
                        <li>转移时玻璃棒下端靠在刻度线以下</li>
                        <li>定容时视线与凹液面最低点平齐</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>实验三：氯气的实验室制法</h4>
                    <p><strong>反应原理：</strong>MnO₂+4HCl(浓)→MnCl₂+Cl₂↑+2H₂O</p>
                    <p><strong>装置：</strong>固液加热型发生装置</p>
                    <p><strong>净化：</strong>通过饱和食盐水除去HCl，通过浓H₂SO₄干燥</p>
                    <p><strong>收集：</strong>向上排空气法或排饱和食盐水法</p>
                    <p><strong>尾气处理：</strong>NaOH溶液吸收</p>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>必须用浓盐酸，稀盐酸不反应</li>
                        <li>加热时温度不宜过高</li>
                        <li>氯气有毒，必须在通风橱中进行</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>实验四：乙酸乙酯的制备</h4>
                    <p><strong>反应原理：</strong>CH₃COOH+CH₃CH₂OH⇌CH₃COOCH₂CH₃+H₂O（可逆反应）</p>
                    <p><strong>条件：</strong>浓H₂SO₄催化、加热</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>在试管中加入乙醇2mL</li>
                        <li>边振荡边缓慢加入浓硫酸2mL</li>
                        <li>再加入冰醋酸2mL</li>
                        <li>加入碎瓷片防止暴沸</li>
                        <li>加热，将产生的蒸气导出至饱和Na₂CO₃溶液液面上</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>浓硫酸先加乙醇再加酸（密度大倒入密度小）</li>
                        <li>饱和Na₂CO₃溶液作用：中和乙酸、溶解乙醇、降低酯溶解度</li>
                        <li>导管不能插入液面以下（防倒吸）</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>附录：化学实验仪器分类与用途</h4>
                    <p><strong>一、反应与加热类容器（耐热玻璃）</strong></p>
                    <div class="key-point"><strong>烧杯(Beaker)：</strong>圆柱形有倾倒嘴，配制溶液/溶解/加热液体，加热需垫石棉网。规格：50-1000mL</div>
                    <div class="key-point"><strong>锥形瓶(Erlenmeyer Flask)：</strong>平底圆锥形窄口，滴定反应/振荡反应（液体不易溅出），加热需垫石棉网</div>
                    <div class="key-point"><strong>圆底烧瓶(Round-bottom Flask)：</strong>球状圆底长颈，加热/蒸馏/回流反应，受热均匀，需垫石棉网</div>
                    <div class="key-point"><strong>平底烧瓶(Flat-bottom Flask)：</strong>球状平底，储存液体/温和加热（不适合强烈加热），可直立放置</div>
                    <div class="key-point"><strong>三口烧瓶(Three-neck Flask)：</strong>三个颈，复杂合成实验，可同时安装冷凝管/温度计/搅拌器</div>
                    <p><strong>二、量器类（普通玻璃，不可加热）</strong></p>
                    <div class="key-point"><strong>容量瓶(Volumetric Flask)：</strong>细长颈梨形平底有磨口塞，精确配制物质的量浓度溶液，瓶颈标线表示特定温度下准确体积，不可加热或长期储存</div>
                    <div class="key-point"><strong>量筒(Graduated Cylinder)：</strong>圆柱形有倾倒嘴，粗略量取液体体积，精度低于滴定管，不可加热或作反应容器</div>
                    <div class="key-point"><strong>滴定管(Burette)：</strong>精确量取液体，酸式(玻璃活塞)/碱式(橡胶管+玻璃珠)，读数精确到0.01mL</div>
                    <p><strong>三、分离与萃取类</strong></p>
                    <div class="key-point"><strong>分液漏斗(Separatory Funnel)：</strong>梨形/球形有活塞和磨口塞，分离互不相溶液体/萃取操作，通过活塞控制下层液体流出</div>
                    <div class="key-point"><strong>滴液漏斗(Dropping Funnel)：</strong>颈部较长末端细，向反应体系缓慢滴加液体试剂，可控制滴加速度</div>
                    <p><strong>四、储存与收集类</strong></p>
                    <div class="key-point"><strong>广口瓶(Wide-mouth Bottle)：</strong>口径大瓶口磨砂，储存固体试剂，不可加热</div>
                    <div class="key-point"><strong>细口瓶(Narrow-mouth Bottle)：</strong>口径小瓶口磨砂，储存液体试剂。棕色瓶储存见光易分解物质（如AgNO₃）</div>
                    <div class="key-point"><strong>集气瓶(Gas Collection Bottle)：</strong>广口瓶口平面磨砂配毛玻璃片，收集气体/进行气体反应</div>
                    <p><strong>五、特殊用途</strong></p>
                    <div class="key-point"><strong>干燥器(Desiccator)：</strong>带磨口盖厚壁玻璃缸内有瓷板，存放已干燥样品防吸湿，底部放干燥剂（硅胶/CaCl₂）</div>
                    <div class="key-point"><strong>称量瓶(Weighing Bottle)：</strong>矮圆柱形配磨口盖，精密称量固体样品，防止吸潮或污染</div>
                    <div class="common-mistake">常见错误：容量瓶用于溶解或储存；量筒用作反应容器；加热规范混淆（烧杯/烧瓶需垫石棉网，容量瓶/量筒严禁加热）</div>
                </div>
            </div>
        `,
        tests: `
            <div class="tests-section">
                <h3>📋 模拟测试</h3>

                <div class="knowledge-card">
                    <h4>基础巩固</h4>
                    <p>1. 下列物质中，含有分子数最多的是（原子质量：H=1，C=12，O=16）</p>
                    <p style="color: var(--gray);">A. 18g H₂O</p>
                    <p style="color: var(--gray);">B. 32g O₂</p>
                    <p style="color: var(--gray);">C. 44g CO₂</p>
                    <p style="color: var(--gray);">D. 64g SO₂</p>
                </div>

                <div class="knowledge-card">
                    <h4>能力提升</h4>
                    <p>2. 用石墨电极电解CuSO₄溶液，阳极产物是（ ）</p>
                    <p style="color: var(--gray);">A. Cu</p>
                    <p style="color: var(--gray);">B. O₂</p>
                    <p style="color: var(--gray);">C. H₂</p>
                    <p style="color: var(--gray);">D. SO₂</p>
                </div>
            </div>
        `
    },
    biology: {
        knowledge: `
            <div class="knowledge-section">
                <h3>📚 生物知识点总结</h3>

                <div class="knowledge-card">
                    <h4>第一章 细胞的分子组成</h4>
                    <div class="key-point">蛋白质：基本单位氨基酸（20种），脱水缩合形成肽键-CO-NH-</div>
                    <div class="key-point">蛋白质多样性原因：氨基酸种类、数目、排列顺序、空间结构</div>
                    <div class="key-point">核酸：DNA（脱氧核苷酸）、RNA（核糖核苷酸），携带遗传信息</div>
                    <div class="key-point">糖类：单糖（葡萄糖）、二糖（蔗糖/麦芽糖/乳糖）、多糖（淀粉/糖原/纤维素）</div>
                    <div class="key-point">脂质：脂肪（储能）、磷脂（构成膜）、固醇（调节）</div>
                    <div class="key-point">水和无机盐：自由水与结合水、无机盐以离子形式存在</div>
                    <div class="common-mistake">常见错误：混淆肽键数与脱水数（n个氨基酸形成m条肽链，肽键数=脱水数=n-m）</div>
                </div>

                <div class="knowledge-card">
                    <h4>第二章 细胞的基本结构</h4>
                    <div class="key-point">细胞膜：流动镶嵌模型，功能特性选择透过性</div>
                    <div class="key-point">细胞器：线粒体（有氧呼吸主要场所）、叶绿体（光合作用场所）</div>
                    <div class="key-point">内质网：粗面（蛋白质加工）、滑面（脂质合成）</div>
                    <div class="key-point">高尔基体：蛋白质进一步加工、分类、包装、运输</div>
                    <div class="key-point">核糖体：蛋白质合成场所（无膜结构）</div>
                    <div class="key-point">细胞核：遗传信息库，DNA存储和复制，控制代谢</div>
                    <div class="key-point">生物膜系统：细胞膜、核膜、细胞器膜的总称</div>
                    <div class="common-mistake">常见错误：混淆不同细胞器的功能；核糖体和中心体无膜</div>
                </div>

                <div class="knowledge-card">
                    <h4>第三章 细胞代谢</h4>
                    <div class="key-point">酶：高效性、专一性、作用条件温和，本质大多数为蛋白质</div>
                    <div class="key-point">酶促反应动力学：底物浓度、酶浓度、温度、pH对酶活性的影响</div>
                    <div class="key-point">ATP：细胞的能量通货，A-P~P~P，远离A的高能磷酸键易断裂</div>
                    <div class="key-point">细胞呼吸：有氧呼吸三个阶段（糖酵解→丙酮酸氧化→电子传递链）</div>
                    <div class="key-point">有氧呼吸总反应式：C₆H₁₂O₆+6O₂+6H₂O→6CO₂+12H₂O+能量</div>
                    <div class="key-point">无氧呼吸：产生酒精+CO₂（植物/酵母菌）或乳酸（动物/乳酸菌）</div>
                    <div class="key-point">光合作用：光反应（类囊体薄膜）→暗反应（叶绿体基质）</div>
                    <div class="key-point">光反应：水的光解→[H]+O₂；ATP合成</div>
                    <div class="key-point">暗反应：CO₂固定→C₃；C₃还原→(CH₂O)+C₅</div>
                    <div class="common-mistake">常见错误：认为光合作用O₂来自CO₂（实际来自H₂O）；混淆光反应与暗反应场所</div>
                </div>

                <div class="knowledge-card">
                    <h4>第四章 细胞的生命历程</h4>
                    <div class="key-point">有丝分裂：前期（膜仁消失现两体）→中期（形定数晰赤道板）→后期（点裂数增均两极）→末期（两消两现重开始）</div>
                    <div class="key-point">减数分裂：减数第一次分裂（同源染色体分离）→减数第二次分裂（着丝点分裂）</div>
                    <div class="key-point">减数分裂与有丝分裂区别：是否有同源染色体分离和联会</div>
                    <div class="key-point">细胞分化：基因的选择性表达</div>
                    <div class="key-point">细胞凋亡：基因控制的程序性死亡（正常生理过程）</div>
                    <div class="key-point">细胞癌变：原癌基因和抑癌基因突变</div>
                    <div class="common-mistake">常见错误：混淆细胞凋亡与细胞坏死；减数分裂中DNA复制次数与分裂次数</div>
                </div>

                <div class="knowledge-card">
                    <h4>第五章 孟德尔遗传定律</h4>
                    <div class="key-point">分离定律：杂合子中，等位基因分离，形成配子时比例1:1</div>
                    <div class="key-point">自由组合定律：非同源染色体上的非等位基因自由组合</div>
                    <div class="key-point">遗传图谱分析：基因型推断、概率计算</div>
                    <div class="key-point">伴性遗传：X染色体显性/隐性遗传、Y染色体遗传</div>
                    <div class="key-point">常见遗传病：色盲（X隐）、白化病（常隐）、多指（常显）</div>
                    <div class="common-mistake">常见错误：分离定律与自由组合定律适用范围混淆；伴性遗传与常染色体遗传判断错误</div>
                </div>

                <div class="knowledge-card">
                    <h4>第六章 遗传的分子基础</h4>
                    <div class="key-point">DNA是主要遗传物质：肺炎双球菌转化实验、噬菌体侵染细菌实验</div>
                    <div class="key-point">DNA复制：半保留复制，边解旋边复制，需要模板、原料、酶、能量</div>
                    <div class="key-point">转录：以DNA一条链为模板合成mRNA，场所主要在细胞核</div>
                    <div class="key-point">翻译：以mRNA为模板，tRNA为运载工具，在核糖体上合成蛋白质</div>
                    <div class="key-point">中心法则：DNA→DNA（复制）、DNA→RNA（转录）、RNA→蛋白质（翻译）</div>
                    <div class="key-point">基因表达调控：转录水平调控、翻译水平调控</div>
                    <div class="common-mistake">常见错误：混淆复制、转录、翻译的原料和场所；密码子在mRNA上，反密码子在tRNA上</div>
                </div>

                <div class="knowledge-card">
                    <h4>第七章 变异与进化</h4>
                    <div class="key-point">基因突变：碱基对的增添、缺失、替换（分子水平变异）</div>
                    <div class="key-point">基因重组：自由组合型、交叉互换型</div>
                    <div class="key-point">染色体变异：结构变异（缺失/重复/倒位/易位）、数目变异</div>
                    <div class="key-point">多倍体：秋水仙素处理抑制纺锤体形成</div>
                    <div class="key-point">现代生物进化理论：种群是进化基本单位，突变和基因重组提供原材料</div>
                    <div class="key-point">自然选择：定向选择作用于表型，改变基因频率</div>
                    <div class="key-point">物种形成：突变→选择→隔离（地理隔离→生殖隔离）</div>
                    <div class="common-mistake">常见错误：基因突变不一定改变氨基酸种类（简并性）；生物进化不一定形成新物种</div>
                </div>

                <div class="knowledge-card">
                    <h4>第八章 生命活动的调节</h4>
                    <div class="key-point">神经调节：反射弧（感受器→传入神经→神经中枢→传出神经→效应器）</div>
                    <div class="key-point">兴奋传导：神经纤维上双向传导，突触间单向传递</div>
                    <div class="key-point">神经递质：突触前膜释放→突触间隙→突触后膜受体</div>
                    <div class="key-point">体液调节：激素通过体液运输作用于靶器官/靶细胞</div>
                    <div class="key-point">血糖调节：胰岛素（降血糖）、胰高血糖素（升血糖）</div>
                    <div class="key-point">甲状腺激素分级调节：下丘脑→TRH→垂体→TSH→甲状腺→甲状腺激素（负反馈）</div>
                    <div class="key-point">免疫调节：非特异性免疫（第一、二道防线）、特异性免疫（第三道防线）</div>
                    <div class="key-point">体液免疫：B细胞→浆细胞→分泌抗体</div>
                    <div class="key-point">细胞免疫：T细胞→效应T细胞→与靶细胞接触</div>
                    <div class="common-mistake">常见错误：突触传递方向判断错误；激素调节中正反馈与负反馈混淆</div>
                </div>

                <div class="knowledge-card">
                    <h4>第九章 生态学</h4>
                    <div class="key-point">种群特征：种群密度、出生率/死亡率、年龄组成、性别比例</div>
                    <div class="key-point">种群数量变化：J型增长（Nt=N₀λᵗ）、S型增长（K值/环境容纳量）</div>
                    <div class="key-point">群落：垂直结构（分层现象）、水平结构（镶嵌分布）</div>
                    <div class="key-point">群落演替：初生演替（从无到有）、次生演替（原有土壤条件保留）</div>
                    <div class="key-point">生态系统的结构：非生物的物质和能量、生产者、消费者、分解者</div>
                    <div class="key-point">能量流动：单向流动、逐级递减（传递效率10%-20%）</div>
                    <div class="key-point">物质循环：碳循环（CO₂形式）、氮循环</div>
                    <div class="key-point">信息传递：物理信息、化学信息、行为信息</div>
                    <div class="key-point">生态系统的稳定性：抵抗力稳定性、恢复力稳定性</div>
                    <div class="common-mistake">常见错误：能量传递效率不是营养级之间的比值；K值不是种群最大数量</div>
                </div>

                <div class="knowledge-card">
                    <h4>第十章 生物技术与工程</h4>
                    <div class="key-point">基因工程：限制酶切割→DNA连接酶连接→导入受体细胞→筛选鉴定</div>
                    <div class="key-point">PCR技术：变性(95°C)→退火(55°C)→延伸(72°C)，指数扩增DNA</div>
                    <div class="key-point">琼脂糖凝胶电泳：根据DNA片段大小分离，小片段迁移快</div>
                    <div class="key-point">植物细胞工程：植物组织培养（全能性）、植物体细胞杂交</div>
                    <div class="key-point">动物细胞工程：动物细胞培养、动物细胞融合、单克隆抗体</div>
                    <div class="key-point">胚胎工程：体外受精、胚胎移植、胚胎分割</div>
                    <div class="common-mistake">常见错误：PCR需要引物不需要解旋酶；限制酶识别特定核苷酸序列</div>
                </div>
            </div>
        `,
        examples: `
            <div class="examples-section">
                <h3>📝 典型例题</h3>

                <div class="knowledge-card">
                    <h4>例题1：蛋白质计算</h4>
                    <p>某蛋白质由2条肽链组成，共有109个氨基酸，则该蛋白质分子中至少含有游离的氨基和羧基数分别为多少？</p>
                    <div class="key-point">解答：每条肽链至少含1个游离氨基和1个游离羧基（位于两端），2条肽链至少含2个游离氨基和2个游离羧基</div>
                    <div class="key-point">脱水数=肽键数=109-2=107</div>
                    <div class="common-mistake">常见错误：认为只有1个游离氨基和1个游离羧基；忘记侧链R基上的氨基/羧基</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题2：孟德尔遗传</h4>
                    <p>孟德尔分离定律的实质是？</p>
                    <div class="key-point">答案：配子形成时，等位基因随同源染色体的分开而分离</div>
                    <div class="common-mistake">分离定律发生在减数分裂Ⅰ后期，等位基因随着同源染色体的分开而分离</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题3：自由组合定律概率计算</h4>
                    <p>基因型为AaBb的个体自交（两对基因独立遗传），子代中基因型为Aabb的个体占多少？</p>
                    <div class="key-point">解答：Aa×Aa→AA:Aa:aa=1:2:1；Bb×Bb→BB:Bb:bb=1:2:1</div>
                    <div class="key-point">Aabb=1/2×1/4=1/8</div>
                    <div class="common-mistake">常见错误：直接用1/4×1/4=1/16（混淆基因型比例与配子比例）</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题4：伴性遗传</h4>
                    <p>一对色觉正常的夫妇，女方父亲患色盲，则他们所生儿子患色盲的概率为？</p>
                    <div class="key-point">解答：色盲为X染色体隐性遗传病。女方父亲色盲(XᵇY)→女方XᴮXᵇ(携带者)</div>
                    <div class="key-point">男方XᴮY正常，儿子X染色体来自母亲</div>
                    <div class="key-point">儿子色盲概率=母亲传递Xᵇ的概率=1/2=50%</div>
                    <div class="common-mistake">常见错误：忘记伴性遗传中儿子只继承母亲的X染色体</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题5：光合呼吸综合</h4>
                    <p>将一植物置于密闭容器中，用红外测量仪测得CO₂吸收量随光照强度变化如下：黑暗时CO₂释放量为4mg/h，光照强度为2klx时CO₂吸收量为0，光照强度为8klx时CO₂吸收量为8mg/h。求光补偿点和光饱和点。</p>
                    <div class="key-point">解答：光补偿点=2klx（净光合=0，即光合=呼吸）</div>
                    <div class="key-point">黑暗时呼吸速率=4mg/h，光补偿点时光合=呼吸=4mg/h</div>
                    <div class="key-point">8klx时净光合=8mg/h，真正光合=8+4=12mg/h</div>
                    <div class="common-mistake">常见错误：混淆净光合速率与真正光合速率；光补偿点不是光照强度为0</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题6：DNA复制计算</h4>
                    <p>一个DNA分子含有100个碱基对，其中含腺嘌呤40个。该DNA连续复制3次，需要游离的胞嘧啶脱氧核苷酸多少个？</p>
                    <div class="key-point">解答：A=40，则T=40，G=C=(200-80)/2=60</div>
                    <div class="key-point">复制3次产生2³=8个DNA分子，新增7个</div>
                    <div class="key-point">需要胞嘧啶=7×60=420个</div>
                    <div class="common-mistake">常见错误：用8×60=480（未减去原DNA中的60个）</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题7：生态系统能量流动</h4>
                    <p>某生态系统中，生产者固定的太阳能为10000kJ，按10%-20%传递效率，第三营养级最多获得多少能量？</p>
                    <div class="key-point">解答：第一营养级→第二营养级：10000×20%=2000kJ（最大传递）</div>
                    <div class="key-point">第二营养级→第三营养级：2000×20%=400kJ</div>
                    <div class="key-point">第三营养级最多获得400kJ能量</div>
                    <div class="common-mistake">常见错误：求"最多"应用最大传递效率20%，不是10%</div>
                </div>
            </div>
        `,
        experiments: `
            <div class="experiments-section">
                <h3>🔬 实验指导</h3>

                <div class="knowledge-card">
                    <h4>实验一：探究酶的专一性</h4>
                    <p><strong>实验目的：</strong>验证酶具有催化作用和专一性</p>
                    <p><strong>实验原理：</strong>利用淀粉酶催化淀粉水解，碘液检测淀粉是否存在</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>制备淀粉溶液和蔗糖溶液</li>
                        <li>设置试管，编号</li>
                        <li>分别加入淀粉酶溶液</li>
                        <li>保温一定时间</li>
                        <li>加入斐林试剂或碘液检测</li>
                        <li>观察颜色变化，记录结果</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>酶需要适宜的温度和pH</li>
                        <li>检测前应煮沸，破坏酶活性</li>
                        <li>斐林试剂需要现配现用</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>实验二：观察根尖分生组织细胞的有丝分裂</h4>
                    <p><strong>实验目的：</strong>观察细胞有丝分裂各个时期的特征</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>培养洋葱根尖（提前3-4天）</li>
                        <li>固定：上午10-14点取材，放入卡诺固定液</li>
                        <li>解离：放入15%盐酸和95%酒精混合液(1:1)，3-5min</li>
                        <li>漂洗：用清水漂洗10min</li>
                        <li>染色：用甲紫或醋酸洋红液染色3-5min</li>
                        <li>制片：弄碎根尖，盖上盖玻片，再盖一片载玻片，用拇指轻压</li>
                        <li>观察：先低倍镜找分生区，再高倍镜观察</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>解离后细胞已死亡，不能观察动态过程</li>
                        <li>分生区细胞特点：正方形、排列紧密</li>
                        <li>大多数细胞处于间期（间期时间最长）</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>实验三：探究植物细胞的吸水与失水</h4>
                    <p><strong>实验目的：</strong>验证植物细胞的渗透吸水和失水</p>
                    <p><strong>实验原理：</strong>成熟植物细胞是一个渗透系统（原生质层相当于半透膜）</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>制作洋葱鳞片叶外表皮临时装片</li>
                        <li>低倍镜观察正常细胞（液泡大、紫色深）</li>
                        <li>在盖玻片一侧滴加0.3g/mL蔗糖溶液，另一侧用吸水纸吸引</li>
                        <li>重复几次，使细胞完全浸润在蔗糖溶液中</li>
                        <li>观察质壁分离现象</li>
                        <li>用清水替换蔗糖溶液，观察质壁分离复原</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>选择紫色洋葱便于观察液泡变化</li>
                        <li>蔗糖溶液浓度不宜过高（细胞会死亡）</li>
                        <li>死细胞不能发生质壁分离复原</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>实验四：叶绿体色素的提取和分离</h4>
                    <p><strong>实验目的：</strong>提取和分离叶绿体中的色素</p>
                    <p><strong>实验原理：</strong>色素溶于有机溶剂；不同色素在层析液中溶解度不同，扩散速度不同</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>提取：研磨叶片（加SiO₂助研磨、CaCO₃防色素破坏、无水乙醇溶解色素）</li>
                        <li>过滤：用尼龙布过滤，收集滤液</li>
                        <li>制备滤纸条：剪去两角，画铅笔细线</li>
                        <li>画滤液细线：用毛细吸管画线，干燥后重复2-3次</li>
                        <li>层析：将滤纸条插入层析液中（细线不能没入层析液）</li>
                        <li>观察：从上到下依次为胡萝卜素(橙黄)、叶黄素(黄)、叶绿素a(蓝绿)、叶绿素b(黄绿)</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>研磨要迅速充分</li>
                        <li>滤液细线要细、直、浓</li>
                        <li>层析液不能没及滤液细线</li>
                        <li>叶绿素a含量最多，叶绿素b溶解度最小</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>实验五：DNA的粗提取与鉴定</h4>
                    <p><strong>实验原理：</strong>DNA在不同浓度NaCl溶液中溶解度不同；DNA遇二苯胺在沸水浴条件下变蓝</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>破碎细胞：研磨鸡血细胞液，加入蒸馏水</li>
                        <li>过滤：用纱布过滤，收集含DNA的滤液</li>
                        <li>溶解DNA：加入2mol/L NaCl溶液，搅拌溶解</li>
                        <li>析出DNA：用0.14mol/L NaCl溶液反复析出和溶解DNA</li>
                        <li>去除杂质：加入嫩肉粉（蛋白酶）或蒸馏水</li>
                        <li>鉴定：加入二苯胺试剂，沸水浴加热5min，呈蓝色</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>DNA在0.14mol/L NaCl中溶解度最低</li>
                        <li>不能用哺乳动物成熟红细胞（无细胞核）</li>
                        <li>玻璃棒搅拌要轻柔，防止DNA断裂</li>
                    </ul>
                </div>
            </div>
        `,
        tests: `
            <div class="tests-section">
                <h3>📋 模拟测试</h3>

                <div class="knowledge-card">
                    <h4>基础巩固</h4>
                    <p>1. 下列细胞器中，不含有磷脂的是（ ）</p>
                    <p style="color: var(--gray);">A. 线粒体</p>
                    <p style="color: var(--gray);">B. 核糖体</p>
                    <p style="color: var(--gray);">C. 内质网</p>
                    <p style="color: var(--gray);">D. 高尔基体</p>
                    <div class="key-point">答案：B（核糖体无膜结构，不含磷脂）</div>
                </div>

                <div class="knowledge-card">
                    <h4>基础巩固</h4>
                    <p>2. 下列关于酶的叙述，正确的是（ ）</p>
                    <p style="color: var(--gray);">A. 酶只能在细胞内起催化作用</p>
                    <p style="color: var(--gray);">B. 酶的催化效率比无机催化剂高</p>
                    <p style="color: var(--gray);">C. 酶的化学本质都是蛋白质</p>
                    <p style="color: var(--gray);">D. 高温能使酶失活，低温也能使酶失活</p>
                    <div class="key-point">答案：B（酶可在细胞外催化；少数酶是RNA；低温抑制酶活性但不失活）</div>
                </div>

                <div class="knowledge-card">
                    <h4>能力提升</h4>
                    <p>3. 基因型为AaBb的个体自交（两对基因独立遗传），子代中基因型为Aabb的个体占多少？</p>
                    <div class="key-point">答案：1/8</div>
                    <div class="common-mistake">Aa×Aa→AA:Aa:aa=1:2:1；Bb×Bb→BB:Bb:bb=1:2:1，所以Aabb=1/2×1/4=1/8</div>
                </div>

                <div class="knowledge-card">
                    <h4>能力提升</h4>
                    <p>4. 将植物置于密闭容器中，在不同光照强度下测定CO₂吸收量。下列叙述正确的是（ ）</p>
                    <p style="color: var(--gray);">A. 黑暗条件下，植物既不进行光合作用也不进行呼吸作用</p>
                    <p style="color: var(--gray);">B. 光补偿点时，光合速率等于呼吸速率</p>
                    <p style="color: var(--gray);">C. 光照强度越大，光合速率越大</p>
                    <p style="color: var(--gray);">D. 光饱和点后，限制光合速率的因素只有CO₂浓度</p>
                    <div class="key-point">答案：B（黑暗时只进行呼吸作用；光照强度增大到一定程度光合速率不再增大；光饱和点后限制因素还有温度等）</div>
                </div>

                <div class="knowledge-card">
                    <h4>高考冲刺</h4>
                    <p>5. 某二倍体动物（2n=4）的基因型为AaBb，若图示细胞为该动物的一个初级精母细胞，请回答：</p>
                    <p>（1）该细胞处于减数第一次分裂______期</p>
                    <p>（2）该细胞分裂后产生的子细胞基因型为______</p>
                    <p>（3）若该动物与基因型为Aabb的个体交配，后代中基因型为AaBb的概率为______</p>
                    <div class="key-point">答案：（1）后期（同源染色体分离）（2）AB和ab或Ab和aB（3）1/2×1/2=1/4</div>
                    <div class="common-mistake">注意：初级精母细胞产生2个次级精母细胞，最终产生4个精细胞</div>
                </div>
            </div>
        `
    }
};

/**
 * 主区域导航 - 切换 section 显示、管理导航按钮激活态并记录当前学科
 * @module navigateTo
 * @example window.navigateTo('chemistry-balancer')
 */
function navigateTo(section) {
    document.querySelectorAll('.section').forEach(s => {
        s.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const targetSection = document.getElementById(section + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
        if (section === 'exam') {
            const examContainer = document.getElementById('exam-content');
            if (examContainer && examPracticeSystem) {
                examPracticeSystem.renderExamDashboard(examContainer);
            }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const navBtn = document.querySelector('[data-subject="' + section + '"]');
    if (navBtn) {
        navBtn.classList.add('active');
    }

    currentSubject = section;
}

// 模块注册表 - 消除猴子补丁依赖
// 各模块可通过 window.registerModule(moduleName, handler) 注册自定义渲染逻辑
// handler 签名: function(containerEl, subject, module)
window.MODULE_REGISTRY = window.MODULE_REGISTRY || {};
window.registerModule = function(type, handler) {
    window.MODULE_REGISTRY[type] = handler;
};

/**
 * 模块内容加载器 - 按学科/模块加载内容，优先查询 MODULE_REGISTRY 再回退默认内容
 * @module loadModuleContent
 * @example window.loadModuleContent('chemistry', 'balancer')
 */
function loadModuleContent(subject, module) {
    const contentId = `${subject}-content`;
    const contentEl = document.getElementById(contentId);
    if (!contentEl) return;

    // 注册表检查 - 优先于默认内容查找，消除猴子补丁顺序依赖
    if (window.MODULE_REGISTRY[module]) {
        window.MODULE_REGISTRY[module](contentEl, subject, module);
        return;
    }

    // default 分支：从 subjectContent 查找默认内容
    if (subjectContent[subject]) {
        const content = subjectContent[subject][module] || '<p>该模块内容正在开发中...</p>';
        contentEl.innerHTML = content;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const subject = this.dataset.subject;
            navigateTo(subject);
        });
    });

    document.querySelectorAll('.module-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const module = this.dataset.module;
            const parent = this.closest('.section');
            if (!parent) return;
            parent.querySelectorAll('.module-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const subject = parent.id.replace('-section', '');
            if (['physics', 'chemistry', 'biology'].includes(subject)) {
                loadModuleContent(subject, module);
            }
        });
    });

    const firstPhysicsTab = document.querySelector('#physics-section .module-tab');
    if (firstPhysicsTab) {
        firstPhysicsTab.click();
    }
});

// ---- window 暴露（核心） ----
window.navigateTo = navigateTo;
window.loadModuleContent = loadModuleContent;
window.subjectContent = subjectContent;
